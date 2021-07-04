import {
  Heading,
  ImageIcon,
  SettingsListItem,
  SettingsListSection,
  SettingsPage,
  Styles,
  SubHeading,
  useBoolState,
} from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles, IconButton } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import LoopIcon from "@material-ui/icons/Loop";
import SearchIcon from "@material-ui/icons/Search";
import { useCallback } from "react";

import Google from "../logos/Google";
import type { GoogleAccount, GoogleMailSearch } from "../schema";
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
  search: GoogleMailSearch;
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
  account: GoogleAccount;
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
        <ImageIcon icon={<Google/>}/>
        <Heading className={classes.headingText}>Settings for {account.email}</Heading>
        <IconButton onClick={reLogin}>
          <LoopIcon/>
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
              <AddCircleIcon/>
            </IconButton>
          </div>
        </>
      }
    >
      {
        account.mailSearches.map((search: GoogleMailSearch) => <SearchSettingsItem
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
