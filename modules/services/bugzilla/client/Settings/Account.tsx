import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles, IconButton } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import SearchIcon from "@material-ui/icons/Search";
import { useCallback } from "react";

import type { ReactResult } from "#client/utils";
import {
  Heading,
  ImageIcon,
  SettingsListSection,
  SettingsPage,
  SettingsListItem,
  SubHeading,
  Styles,
  useBoolState,
  Icons,
  useResetStore,
} from "#client/utils";
import type { BugzillaAccount, BugzillaSearch } from "#schema";

import Icon from "../Icon";
import {
  useDeleteBugzillaSearchMutation,
  useDeleteBugzillaAccountMutation,
} from "../operations";
import SearchDialog from "./SearchDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: theme.spacing(1) + 2,
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
      ...Styles.flexCenteredRow,
    },
    searchLink: {
      cursor: "pointer",
    },
  }),
);

interface SearchSettingsItemProps {
  account: BugzillaAccount;
  search: BugzillaSearch;
}

function SearchSettingsItem({
  account,
  search,
}: SearchSettingsItemProps): ReactResult {
  let classes = useStyles();
  let [editSearchDialogOpen, editSearch, closeEditSearchDialog] =
    useBoolState();

  let resetStore = useResetStore();

  let [deleteSearchMutation] = useDeleteBugzillaSearchMutation({
    variables: {
      search: search.id,
    },
  });

  let deleteSearch = useCallback(async () => {
    await deleteSearchMutation();
    await resetStore();
  }, [deleteSearchMutation, resetStore]);

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
  account: Omit<BugzillaAccount, "username">;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();
  let [showSearchDialog, openSearchDialog, closeSearchDialog] = useBoolState();
  let resetStore = useResetStore();

  let [deleteAccountMutation] = useDeleteBugzillaAccountMutation({
    variables: {
      account: account.id,
    },
  });

  let deleteAccount = useCallback(async () => {
    await deleteAccountMutation();
    await resetStore();
  }, [deleteAccountMutation, resetStore]);

  return (
    <SettingsPage
      heading={
        <>
          <ImageIcon icon={account.icon ?? <Icon />} />
          <Heading className={classes.headingText}>
            Settings for {account.name}
          </Heading>
          <div className={classes.actions}>
            <IconButton onClick={deleteAccount}>
              <Icons.Delete />
            </IconButton>
          </div>
        </>
      }
    >
      <SettingsListSection
        heading={
          <>
            <SubHeading>Searches</SubHeading>
            <div className={classes.actions}>
              <IconButton onClick={openSearchDialog}>
                <AddCircleIcon />
              </IconButton>
            </div>
          </>
        }
      >
        {account.searches.map((search: BugzillaSearch) => (
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
