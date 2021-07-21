import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import { useBoolState, ReactMemo, Dialog, TextFieldInput, FormState } from "#client/utils";

import { useCreateContextMutation, OperationNames } from "../schema";
import GlobalState from "../utils/globalState";
import { pushView, ViewType } from "../utils/view";

interface CreateContextProps {
  onClosed: () => void;
}

export default ReactMemo(function CreateContextDialog({
  onClosed,
}: CreateContextProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [isOpen,, close] = useBoolState(true);

  let [createContextMutation, { loading, error }] = useCreateContextMutation({
    variables: {
      params: state,
    },
    refetchQueries: [
      OperationNames.Query.ListContextState,
    ],
  });

  let createContext = useCallback(async () => {
    let { data } = await createContextMutation();
    let user = GlobalState.user;
    if (!data || !user) {
      throw new Error("Invalid state.");
    }

    let newContext = user.contexts.get(data.createContext.id);
    if (!newContext) {
      throw new Error("New context not present in user state.");
    }

    pushView({
      type: ViewType.TaskList,
      context: newContext,
      taskList: newContext,
    });
  }, [createContextMutation]);

  return <Dialog
    title="Create Context"
    submitLabel="Create"
    error={error}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={createContext}
    formState={loading ? FormState.Loading : FormState.Default}
  >
    <TextFieldInput
      id="name"
      label="Name:"
      autoFocus={true}
      state={state}
      setState={setState}
      stateKey="name"
    />
  </Dialog>;
});
