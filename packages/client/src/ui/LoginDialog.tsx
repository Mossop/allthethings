import { TextFieldInput, ReactMemo, Dialog } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import { useLoginMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";

export default ReactMemo(function LoginDialog(): ReactElement {
  let [state, setState] = useState({
    email: "",
    password: "",
  });

  let [login] = useLoginMutation({
    variables: state,
    refetchQueries: [refetchListContextStateQuery()],
  });

  let submit = useCallback(() => {
    void login();
  }, [login]);

  return <Dialog
    isOpen={true}
    onSubmit={submit}
    title="Login"
    submitLabel="Login"
    cancelLabel={null}
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
