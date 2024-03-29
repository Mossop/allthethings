import type { Theme } from "@mui/material";
import { IconButton } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { DateTime } from "luxon";
import type { ReactElement } from "react";
import { useMemo, useState, useCallback } from "react";

import type {
  GoogleAccountState,
  GoogleMailSearchState,
} from "../../../../client/utils";
import {
  TextFieldInput,
  Dialog,
  useBoolState,
  FormState,
  Icons,
  DateTimeOffsetDialog,
  Styles,
} from "../../../../client/utils";
import type { DateTimeOffset } from "../../../../utils";
import {
  encodeDateTimeOffset,
  decodeDateTimeOffset,
  addOffset,
} from "../../../../utils";
import {
  useCreateGoogleMailSearchMutation,
  useEditGoogleMailSearchMutation,
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
  account: GoogleAccountState;
  search?: GoogleMailSearchState;
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

  let [state, setState] = useState<DialogState>((): DialogState => {
    if (search) {
      return {
        name: search.name,
        query: search.query,
        dueOffset: search.dueOffset
          ? decodeDateTimeOffset(search.dueOffset)
          : null,
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
    useCreateGoogleMailSearchMutation();

  let [editSearch, { loading: pendingEdit, error: editError }] =
    useEditGoogleMailSearchMutation();

  let submit = useCallback(async (): Promise<void> => {
    let apiState = {
      ...state,
      dueOffset: encodeDateTimeOffset(state.dueOffset),
    };

    if (search) {
      await editSearch({
        id: search.id,
        params: apiState,
      });
    } else {
      await createSearch({
        accountId: account.id,
        params: apiState,
      });
    }

    close();
  }, [state, search, close, editSearch, createSearch, account.id]);

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
      title={search ? "Edit GMail Search" : "Add GMail Search"}
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
        label="Search Terms:"
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
