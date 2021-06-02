import { SearchType } from "@allthethings/bugzilla-server";
import {
  RadioGroupInput,
  TextFieldInput,
  Dialog,
  useBoolState,
  useResetStore,
  FormState,
} from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import type { BugzillaAccount, BugzillaSearch } from "../schema";
import {
  refetchListBugzillaAccountsQuery,
  useCreateBugzillaSearchMutation,
} from "../schema";

interface SearchDialogProps {
  account: Omit<BugzillaAccount, "username">;
  onSearchCreated: (search: BugzillaSearch) => void;
  onClosed: () => void;
}

export default function SearchDialog({
  account,
  onSearchCreated,
  onClosed,
}: SearchDialogProps): ReactElement {
  let [state, setState] = useState({
    name: "",
    type: SearchType.Quicksearch,
    query: "",
  });
  let [isOpen, , close] = useBoolState(true);
  let resetStore = useResetStore();

  let [createSearch, { loading, error }] = useCreateBugzillaSearchMutation({
    variables: {
      account: account.id,
      params: state,
    },
    refetchQueries: [
      refetchListBugzillaAccountsQuery(),
    ],
  });

  let submit = useCallback(async (): Promise<void> => {
    let { data } = await createSearch();
    if (!data) {
      return;
    }

    onSearchCreated(data.createBugzillaSearch);
    await resetStore();
  }, []);

  return <Dialog
    title="Add Bugzilla Search"
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

    <RadioGroupInput
      label="Search type:"
      state={state}
      setState={setState}
      stateKey="type"
      values={[
        { value: SearchType.Quicksearch, label: "Quicksearch" },
        { value: SearchType.Advanced, label: "Advanced" },
      ]}
    />

    <TextFieldInput
      id="query"
      label="Query:"
      state={state}
      setState={setState}
      stateKey="query"
      required={true}
    />
  </Dialog>;
}
