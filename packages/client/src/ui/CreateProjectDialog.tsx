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
import { useCreateProjectMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";
import { ReactMemo } from "../utils/types";

interface CreateProjectProps {
  onClose: () => void;
}

export default ReactMemo(function CreateProjectDialog({
  onClose,
}: CreateProjectProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [createProject] = useCreateProjectMutation({
    variables: {
      params: state,
    },
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
  });

  let submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await createProject();
    onClose();
  }, [createProject, onClose]);

  return <Dialog open={true} onClose={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Project</DialogTitle>
      <DialogContent>
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
