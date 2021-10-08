import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import type { ServiceItemProps, ReactResult } from "../../../client/utils";
import { ItemPill, ImageIcon, Styles, ReactMemo } from "../../../client/utils";
import type { BugFields } from "../schema";
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

export default ReactMemo(function Bug({
  fields,
}: ServiceItemProps): ReactResult {
  let classes = useStyles();

  let bug = fields as BugFields;

  return (
    <a className={classes.link} rel="noreferrer" target="_blank" href={bug.url}>
      <div className={classes.iconContainer}>
        <ImageIcon icon={bug.icon ?? <Icon />} />
      </div>
      <div className={classes.summary}>{bug.summary}</div>
      <ItemPill border={false}>{bug.status}</ItemPill>
      {bug.resolution && <ItemPill>{bug.resolution}</ItemPill>}
    </a>
  );
});
