import type { BugFields } from "@allthethings/bugzilla-server";
import type { PluginItemProps, ReactResult } from "@allthethings/ui";
import {
  ImageIcon,
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
    status: {
      paddingLeft: theme.spacing(1),
      textTransform: "uppercase",
      fontSize: "0.7rem",
    },
    resolution: {
      paddingLeft: "0.5em",
      textTransform: "uppercase",
      fontSize: "0.7rem",
    },
  }));

export default ReactMemo(function Bug({
  fields,
}: PluginItemProps): ReactResult {
  let classes = useStyles();

  let bug = JSON.parse(fields) as BugFields;

  return <a className={classes.link} rel="noreferrer" target="_blank" href={bug.url}>
    <div className={classes.iconContainer}>
      <ImageIcon icon={bug.icon ?? <Icon/>}/>
    </div>
    <div className={classes.summary}>{bug.summary}</div>
    <div className={classes.status}>{bug.status}</div>
    {bug.resolution && <div className={classes.resolution}>{bug.resolution}</div>}
  </a>;
});
