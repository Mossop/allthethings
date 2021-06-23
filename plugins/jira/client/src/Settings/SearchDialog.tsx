import {
  TextFieldInput,
  Dialog,
  useBoolState,
  useResetStore,
  FormState,
} from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import type {
  JiraAccount,
  JiraSearch,
} from "../schema";
import {
  refetchListJiraAccountsQuery,
  useCreateJiraSearchMutation,
} from "../schema";

interface SearchDialogProps {
  account: JiraAccount;
  onSearchCreated: (search: JiraSearch) => void;
  onClosed: () => void;
}

export default function SearchDialog({
  account,
  onSearchCreated,
  onClosed,
}: SearchDialogProps): ReactElement {
  let [state, setState] = useState({
    name: "",
    query: "",
  });
  let [isOpen, , close] = useBoolState(true);
  let resetStore = useResetStore();

  let [createSearch, { loading, error }] = useCreateJiraSearchMutation({
    variables: {
      account: account.id,
      params: state,
    },
    refetchQueries: [
      refetchListJiraAccountsQuery(),
    ],
  });

  let submit = useCallback(async (): Promise<void> => {
    let { data } = await createSearch();
    if (!data) {
      return;
    }

    onSearchCreated(data.createJiraSearch);
    await resetStore();
  }, [createSearch, onSearchCreated, resetStore]);

  return <Dialog
    title="Add Jira Issue Search"
    submitLabel="Add"
    error={error}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={submit}
    formState={loading ? FormState.Loading : FormState.Default}
  >
    <TextFieldInput
      id="name"
      label="Name:"
      state={state}
      setState={setState}
      stateKey="name"
      required={true}
      autoFocus={true}
    />

    <TextFieldInput
      id="query"
      label="JQL Query:"
      state={state}
      setState={setState}
      stateKey="query"
      required={true}
    />
  </Dialog>;
}
