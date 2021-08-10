/* eslint-disable @typescript-eslint/naming-convention */
import type { GraphQLCtx } from "#server/utils";
import { rootResolvers } from "#server/utils";

import type { ItemDetail } from "./implementations";
import {
  FileDetail,
  LinkDetail,
  NoteDetail,
  ServiceDetail,
} from "./implementations";
import MutationResolvers from "./mutations";
import QueryResolvers from "./queries";
import type { Resolvers } from "./schema";
import type { CoreTransaction } from "./transaction";

export const coreResolvers = rootResolvers<
  Resolvers,
  GraphQLCtx<CoreTransaction>
>({
  Query: QueryResolvers,
  Mutation: MutationResolvers,

  ItemDetail: {
    __resolveType(
      obj: ItemDetail,
    ): "ServiceDetail" | "LinkDetail" | "NoteDetail" | "FileDetail" {
      if (obj instanceof ServiceDetail) {
        return "ServiceDetail";
      }

      if (obj instanceof LinkDetail) {
        return "LinkDetail";
      }

      if (obj instanceof NoteDetail) {
        return "NoteDetail";
      }

      if (obj instanceof FileDetail) {
        return "FileDetail";
      }

      throw new Error("Unknown type.");
    },
  },
});
