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
import { useCreateNamedContextMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";
import { pushState } from "../utils/navigation";
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

  let [createContext, { error }] = useCreateNamedContextMutation({
    variables: {
      params: state,
    },
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
    awaitRefetchQueries: true,
  });

  let submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    let { data } = await createContext();

    onClose();
    let stub = data?.createNamedContext.stub;
    if (stub) {
      pushState(new URL(`/?context=${stub}`));
    }
  }, [createContext, onClose]);

  return <Dialog open={true} onClose={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Context</DialogTitle>
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
