import type { RevisionFields } from "@allthethings/phabricator-server";
import type { PluginItemProps, ReactResult } from "@allthethings/ui";
import {
  ImageIcon,
  TaskDoneToggle,
  Styles,
  ReactMemo,
} from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import {
  makeStyles,
  createStyles,
} from "@material-ui/core";
import { RevisionStatus } from "conduit-api";

import Icon from "./Icon";

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
    summary: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
    status: {
      paddingLeft: theme.spacing(1),
      textTransform: "uppercase",
      fontSize: "0.7rem",
    },
  }));

const StatusMap: Record<RevisionStatus, string> = {
  [RevisionStatus.Draft]: "Draft",
  [RevisionStatus.NeedsReview]: "Needs Review",
  [RevisionStatus.NeedsRevision]: "Needs Revision",
  [RevisionStatus.ChangesPlanned]: "Changes Planned",
  [RevisionStatus.Accepted]: "Ready to Land",
  [RevisionStatus.Closed]: "Landed",
  [RevisionStatus.Abandoned]: "Abandoned",
};

export default ReactMemo(function Revision({
  item,
}: PluginItemProps): ReactResult {
  let classes = useStyles();

  let revision = JSON.parse(item.detail.fields) as RevisionFields;

  return <>
    <TaskDoneToggle item={item}/>
    <a className={classes.link} rel="noreferrer" target="_blank" href={revision.uri}>
      <div className={classes.iconContainer}>
        <ImageIcon icon={revision.icon ?? <Icon/>}/>
      </div>
      <div className={classes.summary}>{revision.title}</div>
      <div className={classes.status}>{StatusMap[revision.status]}</div>
    </a>
  </>;
});
