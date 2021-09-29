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
import GlobalState from "../utils/globalState";
import { pushView, ViewType } from "../utils/view";

interface CreateContextProps {
  onClosed: () => void;
}

const useCreateContextMutation = mutationHook(api.context.createContext, {
  refreshTokens: [api.state.getState],
});

export default ReactMemo(function CreateContextDialog({
  onClosed,
}: CreateContextProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [isOpen, , close] = useBoolState(true);

  let [createContextMutation, { loading, error }] = useCreateContextMutation();

  let createContext = useCallback(async () => {
    let data = await createContextMutation({ params: state });
    let user = GlobalState.user;
    if (!user) {
      throw new Error("Invalid state.");
    }

    let newContext = user.contexts.get(data.id);
    if (!newContext) {
      throw new Error("New context not present in user state.");
    }

    pushView({
      type: ViewType.TaskList,
      context: newContext,
      taskList: newContext,
    });

    close();
  }, [createContextMutation, state, close]);

  return (
    <Dialog
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
    </Dialog>
  );
});
