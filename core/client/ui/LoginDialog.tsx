import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import { TextFieldInput, ReactMemo, Dialog, FormState, useBoolState } from "#ui";

import { useLoginMutation, refetchListContextStateQuery } from "../schema";

interface LoginDialogProps {
  onClosed: () => void;
}

export default ReactMemo(function LoginDialog({
  onClosed,
}: LoginDialogProps): ReactElement {
  let [state, setState] = useState({
    email: "",
    password: "",
  });

  let [isOpen,, close] = useBoolState(true);

  let [login, { error, loading }] = useLoginMutation({
    variables: state,
    refetchQueries: [refetchListContextStateQuery()],
  });

  let submit = useCallback(async () => {
    await login();
    close();
  }, [login, close]);

  return <Dialog
    isOpen={isOpen}
    onClose={close}
    onSubmit={submit}
    onClosed={onClosed}
    title="Login"
    submitLabel="Login"
    cancelLabel={null}
    error={error}
    formState={loading ? FormState.Loading : FormState.Default}
  >
    <TextFieldInput
      id="email"
      label="Email address:"
      state={state}
      setState={setState}
      stateKey="email"
    />
    <TextFieldInput
      id="password"
      label="Password:"
      type="password"
      state={state}
      setState={setState}
      stateKey="password"
    />
  </Dialog>;
});
