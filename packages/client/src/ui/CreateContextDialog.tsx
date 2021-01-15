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
import { useCreateNamedContextMutation } from "../schema/mutations";
import { refetchNamedContextsQuery } from "../schema/queries";
import { ReactMemo } from "../utils/types";

interface CreateContextProps {
  onClose: () => void;
}

export default ReactMemo(function CreateContextDialog({
  onClose,
}: CreateContextProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [createContext] = useCreateNamedContextMutation({
    variables: {
      params: state,
    },
    refetchQueries: [refetchNamedContextsQuery()],
  });

  let submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await createContext();
    onClose();
  }, [state, onClose]);

  return <Dialog open={true} onClose={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Context</DialogTitle>
      <DialogContent>
        <FormControl margin="normal">
          <InputLabel htmlFor="email">Name:</InputLabel>
          <TextFieldInput id="email" state={state} setState={setState} stateKey="name"/>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" color="primary">Create</Button>
        <Button onClick={onClose} variant="contained">Cancel</Button>
      </DialogActions>
    </form>
  </Dialog>;
});
