import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import {
  TextFieldInput,
  Dialog,
  useBoolState,
  useResetStore,
  FormState,
} from "#client/utils";
import type { GithubAccount, GithubSearch } from "#schema";

import {
  refetchListGithubAccountsQuery,
  useCreateGithubSearchMutation,
} from "../operations";

interface SearchDialogProps {
  account: GithubAccount;
  onSearchCreated: (search: GithubSearch) => void;
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

  let [createSearch, { loading, error }] = useCreateGithubSearchMutation({
    variables: {
      account: account.id,
      params: state,
    },
    refetchQueries: [refetchListGithubAccountsQuery()],
  });

  let submit = useCallback(async (): Promise<void> => {
    let { data } = await createSearch();
    if (!data) {
      return;
    }

    onSearchCreated(data.createGithubSearch);
    await resetStore();
  }, [createSearch, onSearchCreated, resetStore]);

  return (
    <Dialog
      title="Add Search"
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
        label="Search Terms:"
        state={state}
        setState={setState}
        stateKey="query"
        required={true}
      />
    </Dialog>
  );
}
