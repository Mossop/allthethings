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

import { TextFieldInput } from "../components/Forms";
import { useLoginMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";
import { ReactMemo } from "../utils/types";

export default ReactMemo(function LoginDialog(): ReactElement {
  let [state, setState] = useState({
    email: "",
    password: "",
  });

  let [login] = useLoginMutation({
    variables: state,
    refetchQueries: [refetchListContextStateQuery()],
  });

  let submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void login();
  }, [login]);

  return <Dialog open={true}>
    <form onSubmit={submit}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <FormControl margin="normal" variant="outlined">
          <InputLabel htmlFor="email">Email address:</InputLabel>
          <TextFieldInput
            id="email"
            label="Email address:"
            state={state}
            setState={setState}
            stateKey="email"
          />
        </FormControl>
        <FormControl margin="normal" variant="outlined">
          <InputLabel htmlFor="password">Password:</InputLabel>
          <TextFieldInput
            id="password"
            label="Password:"
            type="password"
            state={state}
            setState={setState}
            stateKey="password"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" color="primary">Login</Button>
      </DialogActions>
    </form>
  </Dialog>;
});
