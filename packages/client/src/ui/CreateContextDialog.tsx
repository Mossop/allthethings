import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import type { FormEvent, ReactElement } from "react";
import { useMemo, useEffect, useState, useCallback } from "react";

import Error from "../components/Error";
import { TextFieldInput } from "../components/Forms";
import { useCreateContextMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";
import { useBoolState } from "../utils/hooks";
import { pushView, ViewType } from "../utils/navigation";
import { useView } from "../utils/state";
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
  let view = useView();
  let user = view.user;

  let [isOpen,, close] = useBoolState(true);

  let [createContext, { data, error }] = useCreateContextMutation({
    variables: {
      params: state,
    },
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
    awaitRefetchQueries: true,
  });

  let newContext = useMemo(() => {
    if (!data) {
      return null;
    }

    return user.contexts.get(data.createContext.id) ?? null;
  }, [data, user]);

  useEffect(() => {
    if (!newContext) {
      return;
    }

    pushView({
      type: ViewType.TaskList,
      context: newContext,
      taskList: newContext,
    }, view);
    close();
  }, [newContext, view, close]);

  let submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    void createContext();
  }, [createContext]);

  return <Dialog open={isOpen} onClose={close} onExited={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Create Context</DialogTitle>
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
