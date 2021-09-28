/* eslint-disable @typescript-eslint/naming-convention */
import { URL } from "url";

import type {
  AuthedGraphQLCtx,
  GraphQLCtx,
  ServiceTransaction,
} from "#server/utils";
import { rootResolvers, bestIcon, loadPageInfo } from "#server/utils";

import type {
  MutationCreateBugzillaAccountArgs,
  MutationCreateBugzillaSearchArgs,
  MutationDeleteBugzillaAccountArgs,
  MutationDeleteBugzillaSearchArgs,
  MutationEditBugzillaSearchArgs,
} from "../../../schema";
import type { BugzillaAccountEntity } from "./entities";
import { Search, Account } from "./implementations";
import type { Resolvers } from "./schema";

export default rootResolvers<Resolvers>({
  User: {
    bugzillaAccounts(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
    ): Promise<Account[]> {
      return Account.store(ctx.transaction).find({ userId: ctx.userId });
    },
  },

  Mutation: {
    async createBugzillaAccount(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      {
        params: { url, name, username, password },
      }: MutationCreateBugzillaAccountArgs,
    ): Promise<Account> {
      let record: Omit<BugzillaAccountEntity, "id" | "icon" | "userId"> = {
        url,
        name,
        username: username ?? null,
        password: password ?? null,
      };

      let api = Account.buildAPI(record);
      if (username) {
        await api.whoami();
      } else {
        await api.version();
      }

      let info = await loadPageInfo(ctx.transaction.segment, new URL(url));
      let icon = bestIcon(info.icons, 24)?.url.toString() ?? null;

      return Account.create(ctx.transaction, ctx.userId, {
        ...record,
        icon,
      });
    },

    async deleteBugzillaAccount(
      ctx: GraphQLCtx<ServiceTransaction>,
      { account: accountId }: MutationDeleteBugzillaAccountArgs,
    ): Promise<boolean> {
      let account = await Account.store(ctx.transaction).get(accountId);
      await account.delete();
      return true;
    },

    async createBugzillaSearch(
      ctx: GraphQLCtx<ServiceTransaction>,
      {
        account: accountId,
        params: { name, query, dueOffset },
      }: MutationCreateBugzillaSearchArgs,
    ): Promise<Search> {
      let account = await Account.store(ctx.transaction).get(accountId);

      return Search.create(account, {
        name,
        accountId: account.id,
        ...account.normalizeQuery(query),
        dueOffset: dueOffset ? JSON.stringify(dueOffset) : null,
      });
    },

    async editBugzillaSearch(
      ctx: GraphQLCtx<ServiceTransaction>,
      {
        search: searchId,
        params: { name, query, dueOffset },
      }: MutationEditBugzillaSearchArgs,
    ): Promise<Search | null> {
      let search = await Search.store(ctx.transaction).get(searchId);
      await search.update({
        name,
        query,
        dueOffset: dueOffset ? JSON.stringify(dueOffset) : null,
      });
      return search;
    },

    async deleteBugzillaSearch(
      ctx: GraphQLCtx<ServiceTransaction>,
      { search: searchId }: MutationDeleteBugzillaSearchArgs,
    ): Promise<boolean> {
      let search = await Search.store(ctx.transaction).get(searchId);
      await search.delete();
      return true;
    },
  },
});
