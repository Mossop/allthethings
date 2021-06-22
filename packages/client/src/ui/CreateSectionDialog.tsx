import { Dialog, useBoolState, ReactMemo, TextFieldInput, FormState } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import type { TaskList } from "../schema";
import { refetchQueriesForSection, useCreateSectionMutation } from "../schema";

interface CreateSectionProps {
  onClosed: () => void;
  taskList: TaskList;
}

export default ReactMemo(function CreateSectionDialog({
  onClosed,
  taskList,
}: CreateSectionProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [isOpen,, close] = useBoolState(true);

  let [createSection, { loading, error }] = useCreateSectionMutation({
    variables: {
      taskList: taskList.id,
      params: state,
    },
    refetchQueries: refetchQueriesForSection(taskList),
  });

  let submit = useCallback(async (): Promise<void> => {
    await createSection();
    close();
  }, [createSection, close]);

  return <Dialog
    title="Create Section"
    submitLabel="Create"
    error={error}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={submit}
    formState={loading ? FormState.Loading : FormState.Default}
  >
    <TextFieldInput
      id="name"
      label="Name:"
      state={state}
      setState={setState}
      stateKey="name"
    />
  </Dialog>;
});
