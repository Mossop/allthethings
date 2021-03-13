import { TextFieldInput, ReactMemo, useBoolState, Dialog } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import { useCreateLinkMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { Inbox, Section, TaskList } from "../utils/state";
import { isSection } from "../utils/state";

interface LinkDialogProps {
  onClosed: () => void;
  list: TaskList | Inbox | Section;
}

export default ReactMemo(function LinkDialog({
  onClosed,
  list,
}: LinkDialogProps): ReactElement {
  let [state, setState] = useState({
    url: "",
    isTask: false,
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
          summary: "",
          archived: null,
          snoozed: null,
        },
        detail: {
          url: state.url,
        },
        taskInfo: state.isTask
          ? {
            due: null,
            done: null,
          }
          : null,
      },
    });

    close();
  }, [close, createLink, list.id, state]);

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
  </Dialog>;
});
