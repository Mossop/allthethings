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

import type { PhabricatorAccount } from "../schema";
import {
  refetchListPhabricatorAccountsQuery,
  useDeletePhabricatorAccountMutation,
} from "../schema";

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
  }));

interface AccountSettingsProps {
  account: PhabricatorAccount;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();
  let resetStore = useResetStore();

  let [deleteAccountMutation] = useDeletePhabricatorAccountMutation({
    variables: {
      account: account.id,
    },
    refetchQueries: [
      refetchListPhabricatorAccountsQuery(),
    ],
  });

  let deleteAccount = useCallback(async () => {
    await resetStore();
    await deleteAccountMutation();
  }, [deleteAccountMutation]);

  return <SettingsPage
    heading={
      <>
        <ImageIcon icon={account.icon}/>
        <Heading className={classes.headingText}>Settings for {account.url}</Heading>
        <div className={classes.actions}>
          <IconButton onClick={deleteAccount}>
            <Icons.Delete/>
          </IconButton>
        </div>
      </>
    }
  >
  </SettingsPage>;
}
