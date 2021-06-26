import { TextFieldInput, ReactMemo, useBoolState, Dialog, FormState } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import {
  useCreateTaskMutation,
  useEditItemMutation,
  refetchQueriesForSection,
} from "../schema";
import type { Inbox, TaskList, Section, TaskItem } from "../schema";

type CreateTaskProps = {
  onClosed: () => void;
  list: TaskList | Inbox | Section;
} | {
  onClosed: () => void;
  task: TaskItem;
};

export default ReactMemo(function TaskDialog({
  onClosed,
  ...props
}: CreateTaskProps): ReactElement {
  let task: TaskItem | null;
  let list: TaskList | Inbox | Section;
  if ("task" in props) {
    task = props.task;
    list = task.parent;
  } else {
    list = props.list;
    task = null;
  }

  let [state, setState] = useState({
    summary: task?.summary ?? "",
  });

  let [isOpen,, close] = useBoolState(true);

  let [createTask, { loading: createLoading, error: createError }] = useCreateTaskMutation({
    refetchQueries: refetchQueriesForSection(list),
  });

  let [editItem, { loading: editLoading, error: editError }] = useEditItemMutation({
    refetchQueries: refetchQueriesForSection(list),
  });

  let submit = useCallback(async (): Promise<void> => {
    if (task) {
      await editItem({
        variables: {
          id: task.id,
          item: {
            ...state,
            archived: task.archived,
            snoozed: task.snoozed,
          },
        },
      });
    } else {
      await createTask({
        variables: {
          list: list.id,
          item: {
            ...state,
            archived: null,
            snoozed: null,
          },
        },
      });
    }

    close();
  }, [close, createTask, editItem, list, state, task]);

  return <Dialog
    title={task ? "Edit Task" : "Create Task"}
    submitLabel={task ? "Edit" : "Create"}
    error={createError ?? editError}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={submit}
    formState={createLoading || editLoading ? FormState.Loading : FormState.Default}
  >
    <TextFieldInput
      id="summary"
      label="Summary:"
      state={state}
      setState={setState}
      stateKey="summary"
      autoFocus={true}
    />
  </Dialog>;
});
