import {
  Heading,
  ImageIcon,
  SettingsListSection,
  SettingsPage,
  SubHeading,
} from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import Icon from "../Icon";
import type { BugzillaAccount } from "../schema";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: theme.spacing(1) + 2,
    },
  }));

interface AccountSettingsProps {
  account: Omit<BugzillaAccount, "username">;
}

export default function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();

  return <SettingsPage
    heading={
      <>
        <ImageIcon icon={account.icon ?? <Icon/>}/>
        <Heading className={classes.headingText}>Settings for {account.name}</Heading>
      </>
    }
  >
    <SettingsListSection heading={<SubHeading>Searches</SubHeading>}/>
  </SettingsPage>;
}
