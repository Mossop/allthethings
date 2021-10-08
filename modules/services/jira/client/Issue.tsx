import type { Theme } from "@mui/material";
import { Tooltip } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import type { ReactResult } from "../../../client/utils";
import { ItemPill, ImageIcon, Styles, ReactMemo } from "../../../client/utils";
import type { IssueFields } from "../schema";
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
      padding: `calc(${theme.spacing(1)} + 2px)`,
      ...Styles.flexCentered,
    },
    summary: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  }),
);

export interface IssueProps {
  issue: IssueFields;
}

export default ReactMemo(function Issue({ issue }: IssueProps): ReactResult {
  let classes = useStyles();

  return (
    <a
      className={classes.link}
      rel="noreferrer"
      target="_blank"
      href={issue.url}
    >
      <Tooltip title={issue.type}>
        <div className={classes.iconContainer}>
          <ImageIcon icon={issue.icon ?? <Icon />} />
        </div>
      </Tooltip>
      <div className={classes.summary}>{issue.summary}</div>
      <ItemPill border={false}>{issue.status}</ItemPill>
    </a>
  );
});
