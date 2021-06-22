import { useBoolState, ReactMemo, Dialog, TextFieldInput, FormState } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useMemo, useEffect, useState } from "react";

import { useCreateContextMutation, refetchListContextStateQuery } from "../schema";
import { useLoggedInView, pushView, ViewType } from "../utils/view";

interface CreateContextProps {
  onClosed: () => void;
}

export default ReactMemo(function CreateContextDialog({
  onClosed,
}: CreateContextProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });
  let view = useLoggedInView();
  let user = view.user;

  let [isOpen,, close] = useBoolState(true);

  let [createContext, { data, loading, error }] = useCreateContextMutation({
    variables: {
      params: state,
    },
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
    awaitRefetchQueries: true,
  });

  let newContext = useMemo(() => {
    if (!data) {
      return null;
    }

    return user.contexts.get(data.createContext.id) ?? null;
  }, [data, user]);

  useEffect(() => {
    if (!newContext) {
      return;
    }

    pushView({
      type: ViewType.TaskList,
      context: newContext,
      taskList: newContext,
    }, view);
    close();
  }, [newContext, view, close]);

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
      autoFocus={true}
      id="name"
      label="Name:"
      state={state}
      setState={setState}
      stateKey="name"
    />
  </Dialog>;
});
