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
import { useState, useCallback } from "react";

import Error from "../components/Error";
import { TextFieldInput } from "../components/Forms";
import { useCreateSectionMutation } from "../schema/mutations";
import { refetchListTaskListQuery } from "../schema/queries";
import { useBoolState } from "../utils/hooks";
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

  let submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await createSection();
    close();
  }, [createSection, close]);

  return <Dialog open={isOpen} onClose={close} onExited={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Section</DialogTitle>
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
