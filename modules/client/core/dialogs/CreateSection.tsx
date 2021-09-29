import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import {
  Dialog,
  useBoolState,
  ReactMemo,
  TextFieldInput,
  FormState,
  mutationHook,
  api,
} from "../../utils";
import type { TaskList } from "../schema";

interface CreateSectionProps {
  onClosed: () => void;
  taskList: TaskList;
}

const useCreateSectionMutation = mutationHook(api.section.createSection, {
  // TODO
  refreshTokens: [],
});

export default ReactMemo(function CreateSectionDialog({
  onClosed,
  taskList,
}: CreateSectionProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [isOpen, , close] = useBoolState(true);

  let [createSection, { loading, error }] = useCreateSectionMutation();

  let submit = useCallback(async (): Promise<void> => {
    await createSection({
      taskListId: taskList.id,
      params: state,
    });
    close();
  }, [createSection, taskList.id, state, close]);

  return (
    <Dialog
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
        autoFocus={true}
        state={state}
        setState={setState}
        stateKey="name"
      />
    </Dialog>
  );
});
