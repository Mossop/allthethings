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
  }));

export default ReactMemo(function Revision({
  item,
}: PluginItemProps): ReactResult {
  let classes = useStyles();

  let revision = JSON.parse(item.detail.fields) as RevisionFields;

  return <>
    <TaskDoneToggle item={item}/>
    <a className={classes.link} rel="noreferrer" target="_blank" href={revision.uri}>
      <div className={classes.iconContainer}>
        <ImageIcon icon={<Icon/>}/>
      </div>
      <div className={classes.summary}>{revision.title}</div>
    </a>
  </>;
});
