import { api, queryHook } from "../../../client/utils";

export const useLoginUrlQuery = queryHook(api.google.getLoginUrl, {
  format: "text",
});

export const useListGoogleAccountsQuery = queryHook(api.google.listAccounts);
