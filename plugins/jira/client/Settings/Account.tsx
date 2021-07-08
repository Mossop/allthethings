import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles, IconButton } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import SearchIcon from "@material-ui/icons/Search";
import { useCallback } from "react";

import type { ReactResult } from "#ui";
import {
  Heading,
  ImageIcon,
  SettingsPage,
  Styles,
  Icons,
  useResetStore,
  useBoolState,
  SettingsListSection,
  SubHeading,
  SettingsListItem,
} from "#ui";

import Icon from "../Icon";
import type { JiraAccount, JiraSearch } from "../schema";
import {
  useDeleteJiraSearchMutation,
  refetchListJiraAccountsQuery,
  useDeleteJiraAccountMutation,
} from "../schema";
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
  }));

interface SearchSettingsItemProps {
  search: JiraSearch;
}

function SearchSettingsItem({
  search,
}: SearchSettingsItemProps): ReactResult {
  let classes = useStyles();
  let resetStore = useResetStore();

  let [deleteSearchMutation] = useDeleteJiraSearchMutation({
    variables: {
      id: search.id,
    },
    refetchQueries: [
      refetchListJiraAccountsQuery(),
    ],
  });

  let deleteSearch = useCallback(async () => {
    await resetStore();
    await deleteSearchMutation();
  }, [deleteSearchMutation, resetStore]);

  return <SettingsListItem>
    <div className={classes.searchIcon}>
      <SearchIcon/>
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
      <IconButton onClick={deleteSearch}>
        <Icons.Delete/>
      </IconButton>
    </div>
  </SettingsListItem>;
}

interface AccountSettingsProps {
  account: JiraAccount;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();
  let [showSearchDialog, openSearchDialog, closeSearchDialog] = useBoolState();
  let resetStore = useResetStore();

  let [deleteAccountMutation] = useDeleteJiraAccountMutation({
    variables: {
      account: account.id,
    },
    refetchQueries: [
      refetchListJiraAccountsQuery(),
    ],
  });

  let deleteAccount = useCallback(async () => {
    await resetStore();
    await deleteAccountMutation();
  }, [deleteAccountMutation, resetStore]);

  return <SettingsPage
    heading={
      <>
        <ImageIcon icon={<Icon/>}/>
        <Heading className={classes.headingText}>Settings for {account.url}</Heading>
        <div className={classes.actions}>
          <IconButton onClick={deleteAccount}>
            <Icons.Delete/>
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
              <AddCircleIcon/>
            </IconButton>
          </div>
        </>
      }
    >
      {
        account.searches.map((search: JiraSearch) => <SearchSettingsItem
          key={search.id}
          search={search}
        />)
      }
    </SettingsListSection>
    {
      showSearchDialog && <SearchDialog
        account={account}
        onClosed={closeSearchDialog}
        onSearchCreated={closeSearchDialog}
      />
    }
  </SettingsPage>;
}