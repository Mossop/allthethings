import { api, mutationHook, queryHook } from "../../../client/utils";

export const useLoginUrlQuery = queryHook(api.github.getLoginUrl, {
  format: "text",
});

export const useListGithubAccountsQuery = queryHook(api.github.listAccounts);

export const useCreateGithubSearchMutation = mutationHook(
  api.github.createSearch,
  {
    refreshTokens: [api.github.listAccounts],
  },
);

export const useEditGithubSearchMutation = mutationHook(api.github.editSearch, {
  refreshTokens: [api.github.listAccounts],
});

export const useDeleteGithubSearchMutation = mutationHook(
  api.github.deleteSearch,
  {
    refreshTokens: [api.github.listAccounts],
  },
);
