import { api, mutationHook, queryHook } from "../../../client/utils";

export const useListPhabricatorAccountsQuery = queryHook(
  api.phabricator.listAccounts,
);

export const useCreatePhabricatorAccountMutation = mutationHook(
  api.phabricator.createAccount,
  {
    refreshTokens: [api.phabricator.listAccounts],
  },
);

export const useEditPhabricatorAccountMutation = mutationHook(
  api.phabricator.editAccount,
  {
    refreshTokens: [api.phabricator.listAccounts],
  },
);

export const useDeletePhabricatorAccountMutation = mutationHook(
  api.phabricator.deleteAccount,
  {
    refreshTokens: [api.phabricator.listAccounts],
  },
);

export const useListPhabricatorQueriesQuery = queryHook(
  api.phabricator.listQueries,
);
