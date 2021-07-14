import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import type { ReactResult } from "#client-utils";
import { Styles, ReactMemo } from "#client-utils";
import type { IssueFields } from "#plugins/github/schema";

import IssueIcon from "./logos/Issue";

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

export interface IssueProps {
  issue: IssueFields;
}

export default ReactMemo(function Issue({
  issue,
}: IssueProps): ReactResult {
  let classes = useStyles();

  return <a className={classes.link} rel="noreferrer" target="_blank" href="">
    <div className={classes.iconContainer}>
      <IssueIcon/>
    </div>
    <div className={classes.name}>Bleh</div>
  </a>;
});
