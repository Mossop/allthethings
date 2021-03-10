import { Dialog, useBoolState, ReactMemo, TextFieldInput } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import { useCreateSectionMutation } from "../schema/mutations";
import { refetchListTaskListQuery } from "../schema/queries";
import type { TaskList } from "../utils/state";

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

  let [createSection, { error }] = useCreateSectionMutation({
    variables: {
      taskList: taskList.id,
      params: state,
    },
    refetchQueries: [
      refetchListTaskListQuery({
        taskList: taskList.id,
      }),
    ],
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
