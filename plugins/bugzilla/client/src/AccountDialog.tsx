import { RadioGroupInput, TextFieldInput, Dialog, useBoolState } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import {
  refetchListBugzillaAccountsQuery,
  useCreateBugzillaAccountMutation,
} from "./schema";

enum AuthType {
  Public = "public",
  Password = "password",
  ApiKey = "apikey",
}

interface AccountDialogProps {
  onAccountCreated: (section: string) => void;
  onClosed: () => void;
}

export default function AccountDialog({
  onAccountCreated,
  onClosed,
}: AccountDialogProps): ReactElement {
  let [state, setState] = useState({
    url: "",
    auth: AuthType.Password,
    username: "",
    password: "",
    key: "",
  });
  let [isOpen, , close] = useBoolState(true);

  let [createAccount, { error }] = useCreateBugzillaAccountMutation({
    variables: {
      url: state.url,
      username: state.auth == AuthType.Password ? state.username : state.key,
      password: state.auth == AuthType.Password ? state.password : null,
    },
    refetchQueries: [
      refetchListBugzillaAccountsQuery(),
    ],
  });

  let submit = useCallback(async (): Promise<void> => {
    let { data: account } = await createAccount();
    if (!account) {
      return;
    }

    onAccountCreated(account.createBugzillaAccount.id);
  }, []);

  return <Dialog
    title="Add Bugzilla Account"
    submitLabel="Add"
    error={error}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={submit}
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

    <RadioGroupInput
      label="Authentication type:"
      state={state}
      setState={setState}
      stateKey="auth"
      values={[
        { value: AuthType.Public, label: "Unauthenticated" },
        { value: AuthType.Password, label: "Password" },
        { value: AuthType.ApiKey, label: "API Key" },
      ]}
    />

    {
      state.auth == AuthType.Password && <>
        <TextFieldInput
          id="username"
          label="Username:"
          state={state}
          setState={setState}
          stateKey="username"
          required={true}
        />

        <TextFieldInput
          id="password"
          label="Password:"
          state={state}
          setState={setState}
          stateKey="password"
          required={true}
        />
      </>
    }
    {
      state.auth == AuthType.ApiKey && <TextFieldInput
        id="apikey"
        label="API Key:"
        state={state}
        setState={setState}
        stateKey="key"
        required={true}
      />
    }
  </Dialog>;
}
