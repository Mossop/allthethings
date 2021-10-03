import { api, mutationHook, queryHook } from "../../../client/utils";

export const useLoginUrlQuery = queryHook(api.google.getLoginUrl, {
  format: "text",
});

export const useListGoogleAccountsQuery = queryHook(api.google.listAccounts);

export const useCreateGoogleMailSearchMutation = mutationHook(
  api.google.createSearch,
  {
    refreshTokens: [api.google.listAccounts],
  },
);

export const useEditGoogleMailSearchMutation = mutationHook(
  api.google.editSearch,
  {
    refreshTokens: [api.google.listAccounts],
  },
);

export const useDeleteGoogleMailSearchMutation = mutationHook(
  api.google.deleteSearch,
  {
    refreshTokens: [api.google.listAccounts],
  },
);
