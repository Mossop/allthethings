import {
  TextFieldInput,
  ReactMemo,
  useBoolState,
  Dialog,
  BooleanCheckboxInput,
} from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import { useCreateLinkMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { Inbox, Section, TaskList } from "../utils/state";
import { isSection } from "../utils/state";

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

  let [createLink, { error: createError }] = useCreateLinkMutation({
    refetchQueries: [
      refetchListTaskListQuery({
        taskList: isSection(list) ? list.taskList.id : list.id,
      }),
      refetchListContextStateQuery(),
    ],
  });

  let submit = useCallback(async (): Promise<void> => {
    await createLink({
      variables: {
        list: list.id,
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
  }, [close, createLink, list.id, state, title]);

  return <Dialog
    title="Create Link"
    submitLabel="Create"
    error={createError}
    isOpen={isOpen}
    onClose={close}
    onClosed={onClosed}
    onSubmit={submit}
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
