import type { ThreadFields } from "@allthethings/google-server";
import type { ReactResult } from "@allthethings/ui";
import { Styles, ReactMemo } from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";
import UnreadMailIcon from "@material-ui/icons/Mail";

import GmailIcon from "./logos/Gmail";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      ...Styles.flexCenteredRow,
      flex: 1,
      cursor: "pointer",
      overflow: "hidden",
    },
    iconContainer: {
      padding: theme.spacing(1.5),
      ...Styles.flexCentered,
    },
    subject: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  }));

export interface FileProps {
  thread: ThreadFields;
}

export default ReactMemo(function Thread({
  thread,
}: FileProps): ReactResult {
  let classes = useStyles();

  return <>
    <a className={classes.link} rel="noreferrer" target="_blank" href={thread.url}>
      <div className={classes.iconContainer}>
        <GmailIcon/>
      </div>
      <div className={classes.subject}>{thread.subject}</div>
    </a>
    {thread.unread && <UnreadMailIcon/>}
  </>;
});
