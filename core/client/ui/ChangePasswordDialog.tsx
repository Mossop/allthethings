import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import {
  useBoolState,
  ReactMemo, Dialog,
  TextFieldInput,
  FormState,
} from "#client-utils";

import { useChangePasswordMutation } from "../schema";

interface ChangePasswordProps {
  onClosed: () => void;
}

export default ReactMemo(function ChangePasswordDialog({
  onClosed,
}: ChangePasswordProps): ReactElement {
  let [state, setState] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordAgain: "",
  });

  let [isOpen,, close] = useBoolState(true);

  let [changePasswordMutation, { loading, error }] = useChangePasswordMutation({
    variables: {
      currentPassword: state.currentPassword,
      newPassword: state.newPassword,
    },
  });

  let changePassword = useCallback(async () => {
    if (state.newPassword != state.newPasswordAgain) {
      return;
    }

    await changePasswordMutation();
    onClosed();
  }, [changePasswordMutation, onClosed, state]);

  return <Dialog
    title="Change Password"
    submitLabel="Change"
    error={error}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={changePassword}
    canSubmit={state.newPassword.length > 0 && state.newPassword == state.newPasswordAgain}
    formState={loading ? FormState.Loading : FormState.Default}
  >
    <TextFieldInput
      autoFocus={true}
      required={true}
      id="password"
      label="Current Password:"
      state={state}
      setState={setState}
      stateKey="currentPassword"
    />
    <TextFieldInput
      required={true}
      id="newPassword"
      label="New Password:"
      state={state}
      setState={setState}
      stateKey="newPassword"
    />
    <TextFieldInput
      required={true}
      id="againPassword"
      label="New Password Again:"
      state={state}
      setState={setState}
      stateKey="newPasswordAgain"
    />
  </Dialog>;
});
