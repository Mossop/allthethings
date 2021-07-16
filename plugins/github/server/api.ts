import { URL } from "url";

import { createOAuthUserAuth } from "@octokit/auth-oauth-user";
import { Octokit } from "@octokit/core";
import { print } from "graphql";

import type { AuthedPluginContext } from "#server-utils";

import { GitHubPlugin } from ".";
import type { Account } from "./db/implementations";
import type { IssueLikeQuery, NodeQuery, SearchQuery, UserInfoQuery } from "./operations";
import { nodeQuery, issueLikeQuery, searchQuery, userInfoQuery } from "./operations";
import type { IssueLikeApiResult } from "./types";

const SCOPES = [
  "repo",
];

function generateLoginUrl(pluginUrl: URL, userId: string, user?: string): string {
  let callback = new URL("oauth", pluginUrl);

  let url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", GitHubPlugin.config.clientId);
  url.searchParams.set("redirect_url", callback.toString());
  url.searchParams.set("state", userId);
  url.searchParams.set("scope", SCOPES.join(" "));
  if (user) {
    url.searchParams.set("login", user);
  }

  return url.toString();
}

export function UserInfo(kit: Octokit): Promise<UserInfoQuery> {
  return kit.graphql(print(userInfoQuery));
}

export class GitHubApi {
  private readonly kit: Octokit;

  public constructor(
    private readonly account: Account,
  ) {
    this.kit = GitHubApi.getKit(account.token);
  }

  public async userInfo(): Promise<UserInfoQuery> {
    return UserInfo(this.kit);
  }

  public async node(nodeId: string): Promise<IssueLikeApiResult | null> {
    let result = await this.kit.graphql<NodeQuery>(print(nodeQuery), {
      nodeId,
    });

    if (result.node?.__typename == "Issue" || result.node?.__typename == "PullRequest") {
      return result.node;
    }
    return null;
  }

  public async lookup(
    owner: string,
    repo: string,
    number: number,
  ): Promise<IssueLikeApiResult | null> {
    let result = await this.kit.graphql<IssueLikeQuery>(print(issueLikeQuery), {
      owner,
      repo,
      number,
    });

    return result.repository?.issueOrPullRequest ?? null;
  }

  public async search(query: string): Promise<readonly IssueLikeApiResult[]> {
    let result = await this.kit.graphql<SearchQuery>(print(searchQuery), { query });
    let issueLikes: IssueLikeApiResult[] = [];

    let appendIssues = (result: SearchQuery): void => {
      for (let node of result.search.nodes ?? []) {
        if (node?.__typename == "Issue" || node?.__typename == "PullRequest") {
          issueLikes.push(node);
        }
      }
    };

    appendIssues(result);
    while (result.search.pageInfo.hasNextPage) {
      result = await this.kit.graphql<SearchQuery>(print(searchQuery), {
        query,
        after: result.search.pageInfo.hasNextPage,
      });

      appendIssues(result);
    }

    return issueLikes;
  }

  public generateLoginUrl(): string {
    return generateLoginUrl(this.account.context.pluginUrl, this.account.userId, this.account.user);
  }

  public static generateLoginUrl(
    ctx: AuthedPluginContext,
  ): string {
    return generateLoginUrl(ctx.pluginUrl, ctx.userId);
  }

  public static getKit(token: string): Octokit {
    return new Octokit({
      authStrategy: createOAuthUserAuth,
      auth: {
        clientId: GitHubPlugin.config.clientId,
        clientSecret: GitHubPlugin.config.clientSecret,
        token,
      },
    });
  }

  public static async getToken(code: string): Promise<string> {
    const auth = createOAuthUserAuth({
      clientId: GitHubPlugin.config.clientId,
      clientSecret: GitHubPlugin.config.clientSecret,
      code,
    });

    // Exchanges the code for the user access token authentication on first call
    // and caches the authentication for successive calls
    const { token } = await auth();
    return token;
  }
}
