import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles, IconButton } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import LoopIcon from "@material-ui/icons/Loop";
import SearchIcon from "@material-ui/icons/Search";
import { DateTime } from "luxon";
import { useCallback, useMemo } from "react";

import type {
  GoogleAccountState,
  GoogleMailSearchState,
  ReactResult,
} from "../../../../client/utils";
import {
  useResetStore,
  Icons,
  Heading,
  ImageIcon,
  SettingsListItem,
  SettingsListSection,
  SettingsPage,
  Styles,
  SubHeading,
  useBoolState,
} from "../../../../client/utils";
import type { DateTimeOffset } from "../../../../utils";
import { addOffset, decodeDateTimeOffset } from "../../../../utils";
import { useDeleteGoogleMailSearchMutation } from "../api";
import Google from "../logos/Google";
import SearchDialog from "./SearchDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: theme.spacing(1) + 2,
      flex: 1,
    },
    dueOffset: {
      marginRight: theme.spacing(1),
    },
    actions: {
      flex: 1,
      ...Styles.flexCenteredRow,
      justifyContent: "end",
    },
    searchIcon: {
      paddingLeft: theme.spacing(1),
      ...Styles.flexCenteredRow,
    },
    searchName: {
      padding: theme.spacing(1),
    },
    searchLink: {
      cursor: "pointer",
    },
  }),
);

interface SearchSettingsItemProps {
  account: GoogleAccountState;
  search: GoogleMailSearchState;
}

function SearchSettingsItem({
  account,
  search,
}: SearchSettingsItemProps): ReactResult {
  let classes = useStyles();
  let [editSearchDialogOpen, editSearch, closeEditSearchDialog] =
    useBoolState();

  let resetStore = useResetStore();

  let [deleteSearchMutation] = useDeleteGoogleMailSearchMutation();

  let deleteSearch = useCallback(async () => {
    await deleteSearchMutation({ id: search.id });
    await resetStore();
  }, [deleteSearchMutation, search.id, resetStore]);

  let dueOffset = useMemo(() => {
    if (search.dueOffset) {
      let dueOffset = decodeDateTimeOffset(search.dueOffset);
      let result = addOffset(DateTime.now(), dueOffset as DateTimeOffset);
      return `Due ${result.toRelative()}`;
    }

    return null;
  }, [search]);

  return (
    <SettingsListItem>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <div className={classes.searchName}>
        <a
          href={search.url}
          target="_blank"
          className={classes.searchLink}
          rel="noreferrer"
        >
          {search.name}
        </a>
      </div>
      <div className={classes.actions}>
        {dueOffset && <div className={classes.dueOffset}>{dueOffset}</div>}
        <IconButton onClick={editSearch}>
          <Icons.Edit />
        </IconButton>
        <IconButton onClick={deleteSearch}>
          <Icons.Delete />
        </IconButton>
      </div>
      {editSearchDialogOpen && (
        <SearchDialog
          account={account}
          search={search}
          onClosed={closeEditSearchDialog}
        />
      )}
    </SettingsListItem>
  );
}

interface AccountSettingsProps {
  account: GoogleAccountState;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();
  let [showSearchDialog, openSearchDialog, closeSearchDialog] = useBoolState();

  let reLogin = useCallback(() => {
    window.location.assign(account.loginUrl);
  }, [account]);

  return (
    <SettingsPage
      heading={
        <>
          <ImageIcon icon={<Google />} />
          <Heading className={classes.headingText}>
            Settings for {account.email}
          </Heading>
          <IconButton onClick={reLogin}>
            <LoopIcon />
          </IconButton>
        </>
      }
    >
      <SettingsListSection
        heading={
          <>
            <SubHeading>GMail Searches</SubHeading>
            <div className={classes.actions}>
              <IconButton onClick={openSearchDialog}>
                <AddCircleIcon />
              </IconButton>
            </div>
          </>
        }
      >
        {account.mailSearches.map((search: GoogleMailSearchState) => (
          <SearchSettingsItem
            key={search.id}
            account={account}
            search={search}
          />
        ))}
      </SettingsListSection>
      {showSearchDialog && (
        <SearchDialog account={account} onClosed={closeSearchDialog} />
      )}
    </SettingsPage>
  );
}
