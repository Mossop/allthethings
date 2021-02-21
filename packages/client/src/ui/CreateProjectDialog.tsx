import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import type { FormEvent, ReactElement } from "react";
import { useEffect, useMemo, useState, useCallback } from "react";

import Error from "../components/Error";
import { TextFieldInput } from "../components/Forms";
import { useCreateProjectMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";
import { useBoolState } from "../utils/hooks";
import type { TaskList } from "../utils/state";
import { useProjectRoot } from "../utils/state";
import { ReactMemo } from "../utils/types";
import { useView, pushView, ViewType } from "../utils/view";

interface CreateProjectProps {
  onClose: () => void;
  taskList: TaskList;
}

export default ReactMemo(function CreateProjectDialog({
  onClose,
  taskList,
}: CreateProjectProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });
  let root = useProjectRoot();
  let view = useView();

  let [isOpen,, close] = useBoolState(true);

  let [createProject, { data, error }] = useCreateProjectMutation({
    variables: {
      taskList: taskList.id,
      params: state,
    },
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
  });

  let newProject = useMemo(() => {
    if (!data) {
      return null;
    }

    return root.projects.get(data.createProject.id) ?? null;
  }, [data, root]);

  useEffect(() => {
    if (!newProject) {
      return;
    }

    pushView({
      type: ViewType.TaskList,
      taskList: newProject,
    }, view);

    close();
  }, [newProject, close, view]);

  let submit = useCallback((event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void createProject();
  }, [createProject]);

  return <Dialog open={isOpen} onClose={close} onExited={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Project</DialogTitle>
      <DialogContent>
        {error && <Error error={error}/>}
        <FormControl margin="normal" variant="outlined">
          <InputLabel htmlFor="name">Name:</InputLabel>
          <TextFieldInput
            id="name"
            label="Name:"
            state={state}
            setState={setState}
            stateKey="name"
            autoFocus={true}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" color="primary">Create</Button>
        <Button onClick={close} variant="contained">Cancel</Button>
      </DialogActions>
    </form>
  </Dialog>;
});
