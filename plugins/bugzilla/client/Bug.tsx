import type { Theme } from "@material-ui/core";
import {
  makeStyles,
  createStyles,
} from "@material-ui/core";

import type { PluginItemProps, ReactResult } from "#client-utils";
import {
  ImageIcon,
  Styles,
  ReactMemo,
} from "#client-utils";
import type { BugFields } from "#plugins/bugzilla/schema";

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
