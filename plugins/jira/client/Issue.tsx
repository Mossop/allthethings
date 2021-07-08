import type { Theme } from "@material-ui/core";
import {
  makeStyles,
  createStyles,
  Tooltip,
} from "@material-ui/core";

import type { IssueFields } from "#plugins/jira/schema";
import type { ReactResult } from "#ui";
import {
  ImageIcon,
  Styles,
  ReactMemo,
} from "#ui";

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

export interface IssueProps {
  issue: IssueFields,
}

export default ReactMemo(function Issue({
  issue,
}: IssueProps): ReactResult {
  let classes = useStyles();

  return <a className={classes.link} rel="noreferrer" target="_blank" href={issue.url}>
    <Tooltip title={issue.type}>
      <div className={classes.iconContainer}>
        <ImageIcon icon={issue.icon ?? <Icon/>}/>
      </div>
    </Tooltip>
    <div className={classes.summary}>{issue.summary}</div>
    <div className={classes.status}>{issue.status}</div>
  </a>;
});
