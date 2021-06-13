import type { ReactResult } from "@allthethings/ui";
import {
  TextFieldInput,
  Dialog,
  useBoolState,
  FormState,
  ReactMemo,
  Checkbox,
} from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import type { PhabricatorAccount, PhabricatorQuery } from "../schema";
import {
  useListPhabricatorQueriesQuery,
  refetchListPhabricatorAccountsQuery,
  useCreatePhabricatorAccountMutation,
} from "../schema";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    queriesHeader: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(0.5),
      marginTop: theme.spacing(1),
      fontSize: "1.1rem",
      borderTopWidth: 1,
      borderTopColor: theme.palette.divider,
      borderTopStyle: "solid",
    },
  }));

interface QueryCheckboxProps {
  query: PhabricatorQuery;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
}

const QueryCheckbox = ReactMemo(function QueryCheckbox({
  query,
  checked,
  onChange,
}: QueryCheckboxProps): ReactResult {
  let change = useCallback((checked: boolean) => onChange(query.queryId, checked), [onChange]);
  return <Checkbox
    label={query.description}
    onChange={change}
    checked={checked}
  />;
});

interface AccountDialogProps {
  onAccountCreated: (account: Omit<PhabricatorAccount, "username">) => void;
  onClosed: () => void;
  queries: readonly PhabricatorQuery[];
}

const AccountDialog = ReactMemo(function AccountDialog({
  onAccountCreated,
  onClosed,
  queries,
}: AccountDialogProps): ReactElement {
  let classes = useStyles();

  interface State {
    url: string;
    apiKey: string;
    queries: string[];
  }

  let [state, setState] = useState<State>({
    url: "",
    apiKey: "",
    queries: queries.map((query: PhabricatorQuery): string => query.queryId),
  });
  let [isOpen, , close] = useBoolState(true);

  let [createAccount, { loading, error }] = useCreatePhabricatorAccountMutation({
    variables: {
      params: state,
    },
    refetchQueries: [
      refetchListPhabricatorAccountsQuery(),
    ],
  });

  let submit = useCallback(async (): Promise<void> => {
    let { data: account } = await createAccount();
    if (!account) {
      return;
    }

    onAccountCreated(account.createPhabricatorAccount);
  }, []);

  let changeQuery = useCallback((id: string, enabled: boolean): void => {
    setState((state: State): State => {
      let queries = state.queries.filter((query: string): boolean => query != id);
      if (enabled) {
        queries = [...queries, id];
      }
      return {
        ...state,
        queries,
      };
    });
  }, []);

  return <Dialog
    title="Add Phabricator Account"
    submitLabel="Add"
    error={error}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={submit}
    formState={loading ? FormState.Loading : FormState.Default}
  >
    <TextFieldInput
      id="url"
      label="Address:"
      state={state}
      setState={setState}
      stateKey="url"
      required={true}
    />

    <TextFieldInput
      id="apikey"
      label="API Key:"
      state={state}
      setState={setState}
      stateKey="apiKey"
      required={true}
    />

    <div className={classes.queriesHeader}>Queries</div>

    {
      queries.map((query: PhabricatorQuery) => <QueryCheckbox
        key={query.queryId}
        query={query}
        onChange={changeQuery}
        checked={state.queries.includes(query.queryId)}
      />)
    }
  </Dialog>;
});

export type AccountDialogOuterProps = Omit<AccountDialogProps, "queries">;

export default ReactMemo(function AccountDialogOuter(props: AccountDialogOuterProps): ReactResult {
  let { data } = useListPhabricatorQueriesQuery();

  if (data === undefined) {
    return null;
  }

  return <AccountDialog {...props} queries={data.user?.phabricatorQueries ?? []}/>;
});
