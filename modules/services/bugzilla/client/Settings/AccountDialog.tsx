import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import type { BugzillaAccountState } from "../../../../client/utils";
import {
  RadioGroupInput,
  TextFieldInput,
  Dialog,
  useBoolState,
  FormState,
} from "../../../../client/utils";
import { useCreateBugzillaAccountMutation } from "../api";

enum AuthType {
  Public = "public",
  Password = "password",
  ApiKey = "apikey",
}

interface AccountDialogProps {
  onAccountCreated: (account: BugzillaAccountState) => void;
  onClosed: () => void;
}

export default function AccountDialog({
  onAccountCreated,
  onClosed,
}: AccountDialogProps): ReactElement {
  let [state, setState] = useState({
    name: "",
    url: "",
    auth: AuthType.Public,
    username: "",
    password: "",
    key: "",
  });
  let [isOpen, , close] = useBoolState(true);

  let [createAccount, { loading, error }] = useCreateBugzillaAccountMutation();

  let submit = useCallback(async (): Promise<void> => {
    let account = await createAccount({
      params: {
        name: state.name,
        url: state.url,
        username: state.auth == AuthType.Password ? state.username : state.key,
        password: state.auth == AuthType.Password ? state.password : null,
      },
    });

    onAccountCreated(account);
  }, [createAccount, onAccountCreated, state]);

  return (
    <Dialog
      title="Add Bugzilla Account"
      submitLabel="Add"
      error={error}
      isOpen={isOpen}
      onClose={close}
      onClosed={onClosed}
      onSubmit={submit}
      formState={loading ? FormState.Loading : FormState.Default}
    >
      <TextFieldInput
        id="name"
        label="Name:"
        state={state}
        setState={setState}
        stateKey="name"
        required={true}
        autoFocus={true}
      />

      <TextFieldInput
        id="url"
        label="Address:"
        state={state}
        setState={setState}
        stateKey="url"
        required={true}
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

      {state.auth == AuthType.Password && (
        <>
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
      )}
      {state.auth == AuthType.ApiKey && (
        <TextFieldInput
          id="apikey"
          label="API Key:"
          state={state}
          setState={setState}
          stateKey="key"
          required={true}
        />
      )}
    </Dialog>
  );
}
