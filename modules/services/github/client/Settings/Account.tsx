import AddCircleIcon from "@mui/icons-material/AddCircle";
import LoopIcon from "@mui/icons-material/Loop";
import SearchIcon from "@mui/icons-material/Search";
import type { Theme } from "@mui/material";
import { IconButton } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { useCallback } from "react";

import type {
  GithubAccountState,
  GithubSearchState,
  ReactResult,
} from "../../../../client/utils";
import {
  Icons,
  SettingsListItem,
  Heading,
  ImageIcon,
  SettingsListSection,
  SettingsPage,
  Styles,
  SubHeading,
  useBoolState,
} from "../../../../client/utils";
import { useDeleteGithubSearchMutation } from "../api";
import GitHub from "../logos/GitHub";
import SearchDialog from "./SearchDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: `calc(${theme.spacing(1)} + 2px)`,
      flex: 1,
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
  account: GithubAccountState;
  search: GithubSearchState;
}

function SearchSettingsItem({
  account,
  search,
}: SearchSettingsItemProps): ReactResult {
  let classes = useStyles();
  let [editSearchDialogOpen, editSearch, closeEditSearchDialog] =
    useBoolState();

  let [deleteSearchMutation] = useDeleteGithubSearchMutation();

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
  account: GithubAccountState;
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
          <ImageIcon icon={<GitHub />} />
          <Heading className={classes.headingText}>
            Settings for {account.user}
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
            <SubHeading>GitHub Searches</SubHeading>
            <div className={classes.actions}>
              <IconButton onClick={openSearchDialog}>
                <AddCircleIcon />
              </IconButton>
            </div>
          </>
        }
      >
        {account.searches.map((search: GithubSearchState) => (
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
