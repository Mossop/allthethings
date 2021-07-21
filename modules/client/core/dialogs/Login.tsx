import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import {
  TextFieldInput,
  ReactMemo,
  Dialog,
  FormState,
  useBoolState,
  useResetStore,
} from "#client/utils";

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

  let [loading, setLoading] = useState(false);
  let [error, setError] = useState<Error | null>(null);

  let [isOpen,, close] = useBoolState(true);

  let resetStore = useResetStore();

  let submit = useCallback(async () => {
    setLoading(true);
    let data = new FormData();
    data.set("email", state.email);
    data.set("password", state.password);
    let url = new URL("/api/login", document.URL);
    let response = await fetch(url.toString(), {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      setError(new Error(`Login failed: ${response.statusText}`));
      return;
    }

    await resetStore();
  }, [state, resetStore]);

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
  </Dialog>;
});
