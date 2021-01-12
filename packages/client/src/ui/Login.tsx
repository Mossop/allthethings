import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import type { FormEvent, ReactElement } from "react";
import { useState, useCallback } from "react";

import { TextFieldInput } from "../components/Forms";
import { refetchCurrentUserQuery, useLoginMutation } from "../schema";
import { flexCentered, flexColumn } from "../utils/styles";
import { ReactMemo } from "../utils/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      flexBasis: "75%",
      ...flexCentered,
    },
    form: {
      ...flexColumn,
    },
    buttons: {
      ...flexCentered,
      marginTop: theme.spacing(2),
    },
  }));

export default ReactMemo(function Login(): ReactElement {
  let classes = useStyles();
  let [state, setState] = useState({
    email: "",
    password: "",
  });

  let [login] = useLoginMutation({
    variables: state,
    refetchQueries: [refetchCurrentUserQuery()],
  });

  let submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void login();
  }, [state]);

  return <div className={classes.content}>
    <form className={classes.form} onSubmit={submit}>
      <FormControl margin="normal">
        <InputLabel htmlFor="email">Email address:</InputLabel>
        <TextFieldInput id="email" state={state} setState={setState} stateKey="email"/>
      </FormControl>
      <FormControl margin="normal">
        <InputLabel htmlFor="password">Password:</InputLabel>
        <TextFieldInput
          id="password"
          type="password"
          state={state}
          setState={setState}
          stateKey="password"
        />
      </FormControl>
      <div className={classes.buttons}>
        <Button type="submit" variant="contained" color="primary">Login</Button>
      </div>
    </form>
  </div>;
});
