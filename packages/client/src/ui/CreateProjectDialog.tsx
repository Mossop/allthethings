import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import type { FormEvent, ReactElement } from "react";
import { useEffect, useMemo, useState, useCallback } from "react";

import Error from "../components/Error";
import { TextFieldInput } from "../components/Forms";
import { useCreateProjectMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";
import { pushView, ViewType } from "../utils/navigation";
import type { TaskList } from "../utils/state";
import { useView, useProjectRoot } from "../utils/state";
import { ReactMemo } from "../utils/types";

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
  let currentContext = useProjectRoot();
  let view = useView();

  let [createProject, { data, error }] = useCreateProjectMutation({
    variables: {
      params: {
        name: state.name,
        taskList: taskList.id,
      },
    },
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
  });

  let newProject = useMemo(() => {
    if (!data) {
      return null;
    }

    return currentContext.projects.get(data.createProject.id) ?? null;
  }, [data, currentContext]);

  useEffect(() => {
    if (!newProject) {
      return;
    }

    pushView({
      type: ViewType.TaskList,
      taskList: newProject,
    }, view);

    onClose();
  }, [newProject, onClose, view]);

  let submit = useCallback((event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void createProject();
  }, [createProject]);

  return <Dialog open={true} onClose={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Project</DialogTitle>
      <DialogContent>
        {error && <Error error={error}/>}
        <FormControl margin="normal">
          <InputLabel htmlFor="name">Name:</InputLabel>
          <TextFieldInput
            id="name"
            state={state}
            setState={setState}
            stateKey="name"
            autoFocus={true}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" color="primary">Create</Button>
        <Button onClick={onClose} variant="contained">Cancel</Button>
      </DialogActions>
    </form>
  </Dialog>;
});
