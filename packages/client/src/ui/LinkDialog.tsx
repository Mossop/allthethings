import {
  TextFieldInput,
  ReactMemo,
  useBoolState,
  Dialog,
  BooleanCheckboxInput,
  FormState,
} from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import { useCreateLinkMutation, refetchQueriesForSection, isInbox } from "../schema";
import type { Inbox, TaskList, Section } from "../schema";

interface LinkDialogProps {
  onClosed: () => void;
  list: TaskList | Inbox | Section;
  initialUrl?: string;
  title?: string | null;
}

export default ReactMemo(function LinkDialog({
  onClosed,
  list,
  initialUrl = "",
  title = null,
}: LinkDialogProps): ReactElement {
  let [state, setState] = useState({
    url: initialUrl,
    isTask: true,
  });

  let [isOpen,, close] = useBoolState(true);

  let [createLink, { loading, error: createError }] = useCreateLinkMutation({
    refetchQueries: refetchQueriesForSection(list),
  });

  let submit = useCallback(async (): Promise<void> => {
    await createLink({
      variables: {
        list: isInbox(list) ? null : list.id,
        item: {
          summary: title ?? "",
          archived: null,
          snoozed: null,
        },
        detail: {
          url: state.url,
        },
        isTask: state.isTask,
      },
    });

    close();
  }, [close, createLink, list, state, title]);

  return <Dialog
    title="Create Link"
    submitLabel="Create"
    error={createError}
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
      autoFocus={true}
      autoComplete="url"
      type="url"
    />
    <BooleanCheckboxInput
      label="Create as task"
      state={state}
      setState={setState}
      stateKey="isTask"
    />
  </Dialog>;
});
