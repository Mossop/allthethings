import { TextFieldInput, ReactMemo, useBoolState, Dialog } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import { useCreateTaskMutation, useEditItemMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { Inbox, Section, TaskItem, TaskList } from "../utils/state";
import { isSection } from "../utils/state";

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

  let [createTask, { error: createError }] = useCreateTaskMutation({
    refetchQueries: [
      refetchListTaskListQuery({
        taskList: isSection(list) ? list.taskList.id : list.id,
      }),
      refetchListContextStateQuery(),
    ],
  });

  let [editItem, { error: editError }] = useEditItemMutation({
    refetchQueries: [
      refetchListTaskListQuery({
        taskList: isSection(list) ? list.taskList.id : list.id,
      }),
      refetchListContextStateQuery(),
    ],
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
          taskInfo: {
            due: null,
            done: null,
          },
        },
      });
    }

    close();
  }, [close, createTask, editItem, list.id, state, task]);

  return <Dialog
    title={task ? "Edit Task" : "Create Task"}
    submitLabel={task ? "Edit" : "Create"}
    error={createError ?? editError}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={submit}
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
