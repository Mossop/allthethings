import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import type { ReactResult } from "#client-utils";
import { Styles, ReactMemo } from "#client-utils";
import type { IssueLikeFields } from "#plugins/github/schema";

import IssueIcon from "./logos/Issue";
import PullRequestIcon from "./logos/PullRequest";

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
    name: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  }));

export interface IssueLikeProps {
  issueLike: IssueLikeFields;
}

export default ReactMemo(function IssueLike({
  issueLike,
}: IssueLikeProps): ReactResult {
  let classes = useStyles();

  return <a className={classes.link} rel="noreferrer" target="_blank" href={issueLike.url}>
    <div className={classes.iconContainer}>
      {issueLike.type == "pr" ? <PullRequestIcon/> : <IssueIcon/>}
    </div>
    <div className={classes.name}>{issueLike.title}</div>
  </a>;
});
