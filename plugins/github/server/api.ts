import { URL } from "url";

import { createOAuthUserAuth } from "@octokit/auth-oauth-user";
import { Octokit } from "@octokit/core";

import type { AuthedPluginContext } from "#server-utils";

import { GitHubPlugin } from ".";
import type { Account } from "./db/implementations";
import type { UserInfoQuery } from "./operations";
import { userInfoQuery } from "./operations";

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
  return kit.graphql(userInfoQuery);
}

export class GitHubApi {
  private readonly kit: Octokit;

  public constructor(
    private readonly account: Account,
  ) {
    this.kit = GitHubApi.getKit(account.token);
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
