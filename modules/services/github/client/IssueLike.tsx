import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import type { ReactResult } from "../../../client/utils";
import { ItemPill, Styles, ReactMemo } from "../../../client/utils";
import type { IssueLikeFields, LabelFields } from "../schema";
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
      padding: `calc(${theme.spacing(1)} + 2px)`,
      ...Styles.flexCentered,
    },
    name: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  }),
);

export interface IssueLikeProps {
  issueLike: IssueLikeFields;
}

export default ReactMemo(function IssueLike({
  issueLike,
}: IssueLikeProps): ReactResult {
  let classes = useStyles();

  return (
    <a
      className={classes.link}
      rel="noreferrer"
      target="_blank"
      href={issueLike.url}
    >
      <div className={classes.iconContainer}>
        {issueLike.type == "pr" ? <PullRequestIcon /> : <IssueIcon />}
      </div>
      <div className={classes.name}>{issueLike.title}</div>
      {issueLike.labels.map((label: LabelFields) => (
        <ItemPill
          key={label.name}
          url={label.url}
          border={false}
          style={{
            backgroundColor: `#${label.color}`,
            color: "black",
          }}
        >
          {label.name}
        </ItemPill>
      ))}
      <ItemPill url={issueLike.repository.url}>
        {issueLike.repository.owner}/{issueLike.repository.name}
      </ItemPill>
    </a>
  );
});
