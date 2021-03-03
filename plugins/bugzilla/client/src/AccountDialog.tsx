import { RadioGroupInput, TextFieldInput, useBoolState } from "@allthethings/client";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  FormLabel,
} from "@material-ui/core";
import type { FormEvent, ReactElement } from "react";
import { useState, useCallback } from "react";

import {
  refetchListBugzillaAccountsQuery,
  useCreateBugzillaAccountMutation,
} from "./schema";

enum AuthType {
  Password = "password",
  ApiKey = "apikey",
}

interface AccountDialogProps {
  onAccountCreated: (section: string) => void;
  onClose: () => void;
}

export default function AccountDialog({
  onAccountCreated,
  onClose,
}: AccountDialogProps): ReactElement {
  let [state, setState] = useState({
    url: "",
    auth: AuthType.Password,
    username: "",
    password: "",
    key: "",
  });
  let [isOpen, , close] = useBoolState(true);

  let [createAccount] = useCreateBugzillaAccountMutation({
    variables: {
      url: state.url,
      username: state.auth == AuthType.Password ? state.username : state.key,
      password: state.auth == AuthType.Password ? state.password : null,
    },
    refetchQueries: [
      refetchListBugzillaAccountsQuery(),
    ],
  });

  let submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    let { data: account } = await createAccount();
    if (!account) {
      return;
    }

    onAccountCreated(account.createBugzillaAccount.id);
  }, []);

  return <Dialog open={isOpen} onClose={close} onExited={onClose}>
    <form onSubmit={submit}>
      <DialogTitle>Add Bugzilla Account</DialogTitle>
      <DialogContent>
        <FormControl margin="normal" variant="outlined">
          <InputLabel htmlFor="name">Address:</InputLabel>
          <TextFieldInput
            id="url"
            label="Address:"
            state={state}
            setState={setState}
            stateKey="url"
            required={true}
            autoFocus={true}
          />
        </FormControl>

        <FormControl component="fieldset" margin="normal" variant="outlined">
          <FormLabel component="legend">Authentication type:</FormLabel>
          <RadioGroupInput
            state={state}
            setState={setState}
            stateKey="auth"
            values={[
              [AuthType.Password, "Password"],
              [AuthType.ApiKey, "API Key"],
            ]}
          />
        </FormControl>

        {
          state.auth == AuthType.Password
            ? <>
              <FormControl margin="normal" variant="outlined">
                <InputLabel htmlFor="name">Username:</InputLabel>
                <TextFieldInput
                  id="username"
                  label="Username:"
                  state={state}
                  setState={setState}
                  stateKey="username"
                  required={true}
                />
              </FormControl>

              <FormControl margin="normal" variant="outlined">
                <InputLabel htmlFor="name">Password:</InputLabel>
                <TextFieldInput
                  id="password"
                  label="Password:"
                  state={state}
                  setState={setState}
                  stateKey="password"
                  required={true}
                />
              </FormControl>
            </>
            : <FormControl margin="normal" variant="outlined">
              <InputLabel htmlFor="name">API Key:</InputLabel>
              <TextFieldInput
                id="apikey"
                label="API Key:"
                state={state}
                setState={setState}
                stateKey="key"
                required={true}
              />
            </FormControl>
        }
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" color="primary">Create</Button>
        <Button onClick={close} variant="contained">Cancel</Button>
      </DialogActions>
    </form>
  </Dialog>;
}
