import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import type { Theme } from "@mui/material";
import { IconButton } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { useCallback } from "react";

import type {
  JiraAccountState,
  JiraSearchState,
  ReactResult,
} from "../../../../client/utils";
import {
  Heading,
  ImageIcon,
  SettingsPage,
  Styles,
  Icons,
  useBoolState,
  SettingsListSection,
  SubHeading,
  SettingsListItem,
} from "../../../../client/utils";
import {
  useDeleteJiraSearchMutation,
  useDeleteJiraAccountMutation,
} from "../api";
import Icon from "../Icon";
import SearchDialog from "./SearchDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: `calc(${theme.spacing(1)} + 2px)`,
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
  account: JiraAccountState;
  search: JiraSearchState;
}

function SearchSettingsItem({
  account,
  search,
}: SearchSettingsItemProps): ReactResult {
  let classes = useStyles();
  let [editSearchDialogOpen, editSearch, closeEditSearchDialog] =
    useBoolState();

  let [deleteSearchMutation] = useDeleteJiraSearchMutation();

  let deleteSearch = useCallback(async () => {
    await deleteSearchMutation({ id: search.id });
  }, [deleteSearchMutation, search.id]);

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
  account: JiraAccountState;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();
  let [showSearchDialog, openSearchDialog, closeSearchDialog] = useBoolState();

  let [deleteAccountMutation] = useDeleteJiraAccountMutation();

  let deleteAccount = useCallback(async () => {
    await deleteAccountMutation({ id: account.id });
  }, [account.id, deleteAccountMutation]);

  return (
    <SettingsPage
      heading={
        <>
          <ImageIcon icon={<Icon />} />
          <Heading className={classes.headingText}>
            Settings for {account.url}
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
        {account.searches.map((search: JiraSearchState) => (
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
