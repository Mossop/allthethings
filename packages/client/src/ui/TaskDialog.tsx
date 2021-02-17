import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import type { FormEvent, ReactElement } from "react";
import { useState, useCallback } from "react";

import { TextFieldInput } from "../components/Forms";
import { useCreateTaskMutation, useEditTaskMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import { useBoolState } from "../utils/hooks";
import type { Section, Task, TaskList } from "../utils/state";
import { isSection } from "../utils/state";
import { ReactMemo } from "../utils/types";

type CreateTaskProps = {
  onClose: () => void;
  list: TaskList | Section;
} | {
  onClose: () => void;
  task: Task;
};

export default ReactMemo(function CreateTaskDialog({
  onClose,
  ...props
}: CreateTaskProps): ReactElement {
  let task: Task | null;
  let list: TaskList | Section;
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

  let [createTask] = useCreateTaskMutation({
    refetchQueries: [
      refetchListTaskListQuery({
        taskList: isSection(list) ? list.taskList.id : list.id,
      }),
      refetchListContextStateQuery(),
    ],
  });

  let [editTask] = useEditTaskMutation({
    refetchQueries: [
      refetchListTaskListQuery({
        taskList: isSection(list) ? list.taskList.id : list.id,
      }),
      refetchListContextStateQuery(),
    ],
  });

  let submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (task) {
      await editTask({
        variables: {
          id: task.id,
          params: {
            ...state,
            done: task.done,
            archived: task.archived,
          },
        },
      });
    } else {
      await createTask({
        variables: {
          list: list.id,
          params: {
            ...state,
            done: null,
            archived: false,
          },
        },
      });
    }

    close();
  }, [close, createTask, editTask, list.id, state, task]);

  return <Dialog open={isOpen} onClose={close} onExited={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Task</DialogTitle>
      <DialogContent>
        <FormControl margin="normal" variant="outlined">
          <InputLabel htmlFor="summary">Summary:</InputLabel>
          <TextFieldInput
            id="summary"
            label="Summary:"
            state={state}
            setState={setState}
            stateKey="summary"
            autoFocus={true}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" color="primary">
          {task ? "Edit" : "Create"}
        </Button>
        <Button onClick={close} variant="contained">Cancel</Button>
      </DialogActions>
    </form>
  </Dialog>;
});