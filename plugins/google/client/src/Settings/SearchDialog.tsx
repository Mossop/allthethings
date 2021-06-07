import {
  TextFieldInput,
  Dialog,
  useBoolState,
  useResetStore,
  FormState,
} from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import type { GoogleAccount, GoogleMailSearch } from "../schema";
import {
  refetchListGoogleAccountsQuery,
  useCreateGoogleMailSearchMutation,
} from "../schema";

interface SearchDialogProps {
  account: GoogleAccount;
  onSearchCreated: (search: GoogleMailSearch) => void;
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

  let [createSearch, { loading, error }] = useCreateGoogleMailSearchMutation({
    variables: {
      account: account.id,
      params: state,
    },
    refetchQueries: [
      refetchListGoogleAccountsQuery(),
    ],
  });

  let submit = useCallback(async (): Promise<void> => {
    let { data } = await createSearch();
    if (!data) {
      return;
    }

    onSearchCreated(data.createGoogleMailSearch);
    await resetStore();
  }, []);

  return <Dialog
    title="Add GMail Search"
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
      label="Address or quicksearch:"
      state={state}
      setState={setState}
      stateKey="query"
      required={true}
    />
  </Dialog>;
}
