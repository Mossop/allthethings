import type { ThreadFields } from "@allthethings/google-server";
import type { PluginItemProps, ReactResult } from "@allthethings/ui";
import { Styles, TaskDoneToggle, ReactMemo } from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";
import UnreadMailIcon from "@material-ui/icons/Mail";
import ReadMailIcon from "@material-ui/icons/MailOutline";

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
  item: PluginItemProps["item"];
  thread: ThreadFields;
}

export default ReactMemo(function Thread({
  item,
  thread,
}: FileProps): ReactResult {
  let classes = useStyles();

  return <>
    <TaskDoneToggle item={item}/>
    <a className={classes.link} rel="noreferrer" target="_blank" href={thread.url}>
      <div className={classes.iconContainer}>
        {thread.unread ? <UnreadMailIcon/> : <ReadMailIcon/>}
      </div>
      <div className={classes.subject}>{thread.subject}</div>
    </a>
  </>;
});
