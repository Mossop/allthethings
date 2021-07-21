import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles, IconButton } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import LoopIcon from "@material-ui/icons/Loop";
import SearchIcon from "@material-ui/icons/Search";
import { useCallback } from "react";

import type { ReactResult } from "#client/utils";
import {
  SettingsListItem,
  Heading,
  ImageIcon,
  SettingsListSection,
  SettingsPage,
  Styles,
  SubHeading,
  useBoolState,
} from "#client/utils";
import type { GithubAccount, GithubSearch } from "#schema";

import GitHub from "../logos/GitHub";
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
  }));

interface SearchSettingsItemProps {
  search: GithubSearch;
}

function SearchSettingsItem({
  search,
}: SearchSettingsItemProps): ReactResult {
  let classes = useStyles();
  // let resetStore = useResetStore();

  // let [deleteSearchMutation] = useDeleteBugzillaSearchMutation({
  //   variables: {
  //     search: search.id,
  //   },
  //   refetchQueries: [
  //     refetchListBugzillaAccountsQuery(),
  //   ],
  // });

  // let deleteSearch = useCallback(async () => {
  //   await resetStore();
  //   await deleteSearchMutation();
  // }, [deleteSearchMutation]);

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
      {/* <IconButton onClick={deleteSearch}>
        <Icons.Delete/>
      </IconButton> */}
    </div>
  </SettingsListItem>;
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

  return <SettingsPage
    heading={
      <>
        <ImageIcon icon={<GitHub/>}/>
        <Heading className={classes.headingText}>Settings for {account.user}</Heading>
        <IconButton onClick={reLogin}>
          <LoopIcon/>
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
              <AddCircleIcon/>
            </IconButton>
          </div>
        </>
      }
    >
      {
        account.searches.map((search: GithubSearch) => <SearchSettingsItem
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
