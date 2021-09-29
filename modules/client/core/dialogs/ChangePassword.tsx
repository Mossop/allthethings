import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import {
  useBoolState,
  ReactMemo,
  Dialog,
  TextFieldInput,
  FormState,
  mutationHook,
  api,
} from "../../utils";

interface ChangePasswordProps {
  onClosed: () => void;
}

const useChangePasswordMutation = mutationHook(api.users.editUser);

export default ReactMemo(function ChangePasswordDialog({
  onClosed,
}: ChangePasswordProps): ReactElement {
  let [state, setState] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordAgain: "",
  });

  let [isOpen, , close] = useBoolState(true);

  let [changePasswordMutation, { loading, error }] =
    useChangePasswordMutation();

  let changePassword = useCallback(async () => {
    if (state.newPassword != state.newPasswordAgain) {
      return;
    }

    await changePasswordMutation({
      password: state.newPassword,
      currentPassword: state.currentPassword,
    });
    onClosed();
  }, [changePasswordMutation, onClosed, state]);

  return (
    <Dialog
      title="Change Password"
      submitLabel="Change"
      error={error}
      isOpen={isOpen}
      onClose={close}
      onClosed={onClosed}
      onSubmit={changePassword}
      canSubmit={
        state.newPassword.length > 0 &&
        state.newPassword == state.newPasswordAgain
      }
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
    </Dialog>
  );
});
