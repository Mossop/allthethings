import { TextFieldInput, Dialog, useBoolState, FormState } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import type { PhabricatorAccount } from "../schema";
import {
  refetchListPhabricatorAccountsQuery,
  useCreatePhabricatorAccountMutation,
} from "../schema";

interface AccountDialogProps {
  onAccountCreated: (account: Omit<PhabricatorAccount, "username">) => void;
  onClosed: () => void;
}

export default function AccountDialog({
  onAccountCreated,
  onClosed,
}: AccountDialogProps): ReactElement {
  let [state, setState] = useState({
    url: "",
    apiKey: "",
  });
  let [isOpen, , close] = useBoolState(true);

  let [createAccount, { loading, error }] = useCreatePhabricatorAccountMutation({
    variables: {
      params: {
        url: state.url,
        apiKey: state.apiKey,
      },
    },
    refetchQueries: [
      refetchListPhabricatorAccountsQuery(),
    ],
  });

  let submit = useCallback(async (): Promise<void> => {
    let { data: account } = await createAccount();
    if (!account) {
      return;
    }

    onAccountCreated(account.createPhabricatorAccount);
  }, []);

  return <Dialog
    title="Add Phabricator Account"
    submitLabel="Add"
    error={error}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={submit}
    formState={loading ? FormState.Loading : FormState.Default}
  >
    <TextFieldInput
      id="url"
      label="Address:"
      state={state}
      setState={setState}
      stateKey="url"
      required={true}
    />

    <TextFieldInput
      id="apikey"
      label="API Key:"
      state={state}
      setState={setState}
      stateKey="apiKey"
      required={true}
    />
  </Dialog>;
}
