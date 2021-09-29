import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles, IconButton } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import LoopIcon from "@material-ui/icons/Loop";
import SearchIcon from "@material-ui/icons/Search";
import { useCallback } from "react";

import type { ReactResult } from "../../../../client/utils";
import {
  Icons,
  useResetStore,
  SettingsListItem,
  Heading,
  ImageIcon,
  SettingsListSection,
  SettingsPage,
  Styles,
  SubHeading,
  useBoolState,
} from "../../../../client/utils";
import type { GithubAccount, GithubSearch } from "../../../../schema";
import GitHub from "../logos/GitHub";
import { useDeleteGithubSearchMutation } from "../operations";
import SearchDialog from "./SearchDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: theme.spacing(1) + 2,
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
  account: GithubAccount;
  search: GithubSearch;
}

function SearchSettingsItem({
  account,
  search,
}: SearchSettingsItemProps): ReactResult {
  let classes = useStyles();
  let resetStore = useResetStore();
  let [editSearchDialogOpen, editSearch, closeEditSearchDialog] =
    useBoolState();

  let [deleteSearchMutation] = useDeleteGithubSearchMutation({
    variables: {
      id: search.id,
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
  account: GithubAccount;
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
        {account.searches.map((search: GithubSearch) => (
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
