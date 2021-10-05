import { api, mutationHook, queryHook } from "../../../client/utils";

export const useListJiraAccountsQuery = queryHook(api.jira.listAccounts);

export const useCreateJiraAccountMutation = mutationHook(
  api.jira.createAccount,
  {
    refreshTokens: [api.jira.listAccounts],
  },
);

export const useDeleteJiraAccountMutation = mutationHook(
  api.jira.deleteAccount,
  {
    refreshTokens: [api.jira.listAccounts],
  },
);

export const useCreateJiraSearchMutation = mutationHook(api.jira.createSearch, {
  refreshTokens: [api.jira.listAccounts],
});

export const useEditJiraSearchMutation = mutationHook(api.jira.editSearch, {
  refreshTokens: [api.jira.listAccounts],
});

export const useDeleteJiraSearchMutation = mutationHook(api.jira.deleteSearch, {
  refreshTokens: [api.jira.listAccounts],
});
