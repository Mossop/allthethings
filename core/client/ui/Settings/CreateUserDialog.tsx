import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import {
  useBoolState,
  ReactMemo, Dialog,
  TextFieldInput,
  BooleanCheckboxInput,
} from "#ui";

import { useCreateUserMutation } from "../../schema";
import { refetchListUsersQuery } from "../../schema/queries";

interface CreateUserProps {
  onClosed: () => void;
}

export default ReactMemo(function CreateUserDialog({
  onClosed,
}: CreateUserProps): ReactElement {
  let [state, setState] = useState({
    email: "",
    password: "",
    isAdmin: false,
  });

  let [isOpen,, close] = useBoolState(true);

  let [createUserMutation, { error }] = useCreateUserMutation({
    variables: state,
    refetchQueries: [
      refetchListUsersQuery(),
    ],
  });

  let createUser = useCallback(async () => {
    await createUserMutation();
    onClosed();
  }, [createUserMutation, onClosed]);

  return <Dialog
    title="Create User"
    submitLabel="Create"
    error={error}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={createUser}
  >
    <TextFieldInput
      autoFocus={true}
      id="email"
      label="Email Address:"
      state={state}
      setState={setState}
      stateKey="email"
    />
    <TextFieldInput
      id="password"
      label="Password:"
      state={state}
      setState={setState}
      stateKey="password"
    />
    <BooleanCheckboxInput
      label="Create as an admin user."
      state={state}
      setState={setState}
      stateKey="isAdmin"
    />
  </Dialog>;
});
