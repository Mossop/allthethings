import { Heading, Styles } from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import { makeStyles, createStyles } from "@material-ui/core";

import type { BugzillaAccount } from "../schema";

const useStyles = makeStyles(() =>
  createStyles({
    settings: Styles.flexColumn,
    header: Styles.flexRow,
  }));

interface AccountSettingsProps {
  account: Omit<BugzillaAccount, "username">;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();

  return <div className={classes.settings}>
    <div className={classes.header}>
      <Heading>Settings for {account.name}</Heading>
    </div>
  </div>;
}
