/* eslint-disable @typescript-eslint/naming-convention */
import type {
  MutationCreateGoogleMailSearchArgs,
  MutationDeleteGoogleMailSearchArgs,
  MutationEditGoogleMailSearchArgs,
} from "../../../schema";
import type {
  AuthedGraphQLCtx,
  ServiceTransaction,
} from "../../../server/utils";
import { rootResolvers } from "../../../server/utils";
import { Account, MailSearch } from "./implementations";
import type { Resolvers } from "./schema";

export default rootResolvers<Resolvers>({
  Mutation: {
    async createGoogleMailSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { account: accountId, params }: MutationCreateGoogleMailSearchArgs,
    ): Promise<MailSearch> {
      let account = await Account.store(ctx.transaction).get(accountId);

      return MailSearch.create(account, {
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });
    },

    async editGoogleMailSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { id, params }: MutationEditGoogleMailSearchArgs,
    ): Promise<MailSearch | null> {
      let search = await MailSearch.store(ctx.transaction).get(id);

      await search.update({
        ...params,
        dueOffset: params.dueOffset ? JSON.stringify(params.dueOffset) : null,
      });

      await search.updateList();

      return search;
    },

    async deleteGoogleMailSearch(
      ctx: AuthedGraphQLCtx<ServiceTransaction>,
      { id }: MutationDeleteGoogleMailSearchArgs,
    ): Promise<boolean> {
      let search = await MailSearch.store(ctx.transaction).get(id);
      await search.delete();
      return true;
    },
  },
});
