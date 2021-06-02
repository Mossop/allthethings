import {
  Heading,
  ImageIcon,
  SettingsPage,
  Styles,
} from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import Google from "../logos/Google";
import type { GoogleAccount } from "../schema";

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
    searchName: {
      padding: theme.spacing(1),
    },
    searchLink: {
      cursor: "pointer",
    },
  }));

interface AccountSettingsProps {
  account: GoogleAccount;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();

  return <SettingsPage
    heading={
      <>
        <ImageIcon icon={<Google/>}/>
        <Heading className={classes.headingText}>Settings for {account.email}</Heading>
      </>
    }
  >
  </SettingsPage>;
}
