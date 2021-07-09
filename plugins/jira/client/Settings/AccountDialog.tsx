import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import type { JiraAccount } from "#schema";
import { TextFieldInput, Dialog, useBoolState, FormState } from "#client-utils";

import { refetchListJiraAccountsQuery, useCreateJiraAccountMutation } from "../operations";

interface AccountDialogProps {
  onAccountCreated: (account: JiraAccount) => void;
  onClosed: () => void;
}

export default function AccountDialog({
  onAccountCreated,
  onClosed,
}: AccountDialogProps): ReactElement {
  let [state, setState] = useState({
    url: "",
    email: "",
    apiToken: "",
  });
  let [isOpen, , close] = useBoolState(true);

  let [createAccount, { loading, error }] = useCreateJiraAccountMutation({
    variables: {
      params: state,
    },
    refetchQueries: [
      refetchListJiraAccountsQuery(),
    ],
  });

  let submit = useCallback(async (): Promise<void> => {
    let { data: account } = await createAccount();
    if (!account) {
      return;
    }

    onAccountCreated(account.createJiraAccount);
  }, [createAccount, onAccountCreated]);

  return <Dialog
    title="Add Jira Account"
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
      autoFocus={true}
    />

    <TextFieldInput
      id="email"
      label="Email Address:"
      state={state}
      setState={setState}
      stateKey="email"
      required={true}
    />

    <TextFieldInput
      id="apikey"
      label="API Token:"
      state={state}
      setState={setState}
      stateKey="apiToken"
      required={true}
    />
  </Dialog>;
}
