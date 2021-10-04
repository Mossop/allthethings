import { api, mutationHook, queryHook } from "../../../client/utils";

export const useListBugzillaAccountsQuery = queryHook(
  api.bugzilla.listAccounts,
);

export const useCreateBugzillaAccountMutation = mutationHook(
  api.bugzilla.createAccount,
  {
    refreshTokens: [api.bugzilla.listAccounts],
  },
);

export const useDeleteBugzillaAccountMutation = mutationHook(
  api.bugzilla.deleteAccount,
  {
    refreshTokens: [api.bugzilla.listAccounts],
  },
);

export const useCreateBugzillaSearchMutation = mutationHook(
  api.bugzilla.createSearch,
  {
    refreshTokens: [api.bugzilla.listAccounts],
  },
);

export const useEditBugzillaSearchMutation = mutationHook(
  api.bugzilla.editSearch,
  {
    refreshTokens: [api.bugzilla.listAccounts],
  },
);

export const useDeleteBugzillaSearchMutation = mutationHook(
  api.bugzilla.deleteSearch,
  {
    refreshTokens: [api.bugzilla.listAccounts],
  },
);
