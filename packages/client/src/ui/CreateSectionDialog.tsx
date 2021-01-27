import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import type { FormEvent, ReactElement } from "react";
import { useState, useCallback } from "react";

import Error from "../components/Error";
import { TextFieldInput } from "../components/Forms";
import { useCreateSectionMutation } from "../schema/mutations";
import { refetchListTaskListQuery } from "../schema/queries";
import type { TaskList } from "../utils/state";
import { ReactMemo } from "../utils/types";

interface CreateSectionProps {
  onClose: () => void;
  taskList: TaskList;
}

export default ReactMemo(function CreateSectionDialog({
  onClose,
  taskList,
}: CreateSectionProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [createSection, { error }] = useCreateSectionMutation({
    variables: {
      params: {
        name: state.name,
        taskList: taskList.id,
      },
    },
    refetchQueries: [
      refetchListTaskListQuery({
        taskList: taskList.id,
      }),
    ],
  });

  let submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await createSection();
    onClose();
  }, [createSection, onClose]);

  return <Dialog open={true} onClose={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Section</DialogTitle>
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
