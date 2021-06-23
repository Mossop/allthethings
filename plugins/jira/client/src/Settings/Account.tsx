import {
  Heading,
  ImageIcon,
  SettingsPage,
  Styles,
  Icons,
  useResetStore,
} from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles, IconButton } from "@material-ui/core";
import { useCallback } from "react";

import Icon from "../Icon";
import type { JiraAccount } from "../schema";
import { refetchListJiraAccountsQuery, useDeleteJiraAccountMutation } from "../schema";

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

interface AccountSettingsProps {
  account: JiraAccount;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();

  let [deleteAccountMutation] = useDeleteJiraAccountMutation({
    variables: {
      account: account.id,
    },
    refetchQueries: [
      refetchListJiraAccountsQuery(),
    ],
  });
  let resetStore = useResetStore();

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
  />;
}