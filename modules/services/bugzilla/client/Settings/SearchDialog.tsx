import type { Theme } from "@material-ui/core";
import { createStyles, IconButton, makeStyles } from "@material-ui/core";
import { DateTime } from "luxon";
import type { ReactElement } from "react";
import { useMemo, useState, useCallback } from "react";

import type {
  BugzillaAccountState,
  BugzillaSearchState,
} from "../../../../client/utils";
import {
  TextFieldInput,
  Dialog,
  useBoolState,
  FormState,
  DateTimeOffsetDialog,
  Icons,
  Styles,
} from "../../../../client/utils";
import type { DateTimeOffset } from "../../../../utils";
import {
  addOffset,
  encodeDateTimeOffset,
  decodeDateTimeOffset,
} from "../../../../utils";
import {
  useCreateBugzillaSearchMutation,
  useEditBugzillaSearchMutation,
} from "../api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dueRow: {
      ...Styles.flexCenteredRow,
      justifyContent: "end",
    },
    dueLabel: {
      marginRight: theme.spacing(1),
    },
  }),
);

interface SearchDialogProps {
  account: BugzillaAccountState;
  search?: BugzillaSearchState;
  onClosed: () => void;
}

interface DialogState {
  name: string;
  query: string;
  dueOffset: DateTimeOffset | null;
}

export default function SearchDialog({
  account,
  search,
  onClosed,
}: SearchDialogProps): ReactElement {
  let classes = useStyles();

  let [state, setState] = useState<DialogState>(() => {
    if (search) {
      return {
        name: search.name,
        query: search.query,
        dueOffset: decodeDateTimeOffset(search.dueOffset),
      };
    }

    return {
      name: "",
      query: "",
      dueOffset: null,
    };
  });
  let [isOpen, , close] = useBoolState(true);
  let [isDueDialogOpen, openDueDialog, closeDueDialog] = useBoolState();

  let [createSearch, { loading: pendingCreate, error: createError }] =
    useCreateBugzillaSearchMutation();

  let [editSearch, { loading: pendingEdit, error: editError }] =
    useEditBugzillaSearchMutation();

  let submit = useCallback(async (): Promise<void> => {
    if (search) {
      await editSearch({
        id: search.id,
        params: {
          ...state,
          dueOffset: encodeDateTimeOffset(state.dueOffset),
        },
      });
    } else {
      await createSearch({
        accountId: account.id,
        params: {
          ...state,
          dueOffset: encodeDateTimeOffset(state.dueOffset),
        },
      });
    }

    close();
  }, [search, close, editSearch, state, createSearch, account.id]);

  let due = useMemo(() => {
    if (state.dueOffset) {
      return `Due in ${addOffset(
        DateTime.now(),
        state.dueOffset,
      ).toRelative()}`;
    }
    return "Never due";
  }, [state]);

  let setDue = useCallback((dueOffset: DateTimeOffset) => {
    setState((state: DialogState) => ({
      ...state,
      dueOffset,
    }));
  }, []);

  let clearDue = useCallback(() => {
    setState((state: DialogState) => ({
      ...state,
      dueOffset: null,
    }));
  }, []);

  return (
    <Dialog
      title={search ? "Edit Bugzilla Search" : "Add Bugzilla Search"}
      submitLabel={search ? "Edit" : "Add"}
      error={search ? editError : createError}
      isOpen={isOpen}
      onClose={close}
      onClosed={onClosed}
      onSubmit={submit}
      formState={
        pendingCreate || pendingEdit ? FormState.Loading : FormState.Default
      }
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

      <div className={classes.dueRow}>
        <div className={classes.dueLabel}>{due}</div>
        <IconButton onClick={openDueDialog}>
          <Icons.Edit />
        </IconButton>
        <IconButton disabled={state.dueOffset === null} onClick={clearDue}>
          <Icons.Cancel />
        </IconButton>
      </div>

      {isDueDialogOpen && (
        <DateTimeOffsetDialog
          title="Choose when tasks are due"
          initialValue={state.dueOffset}
          onSelect={setDue}
          onClosed={closeDueDialog}
        />
      )}
    </Dialog>
  );
}
