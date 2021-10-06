import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import {
  TextFieldInput,
  ReactMemo,
  Dialog,
  FormState,
  useBoolState,
} from "../../utils";
import { useLogin } from "../utils/api";

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

  let [login, { loading, error }] = useLogin();

  let [isOpen, , close] = useBoolState(true);

  let submit = useCallback(async () => {
    await login(state);
  }, [state, login]);

  return (
    <Dialog
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
        autoFocus={true}
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
    </Dialog>
  );
});
