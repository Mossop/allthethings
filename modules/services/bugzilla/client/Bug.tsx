import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import type { ServiceItemProps, ReactResult } from "#client/utils";
import { ItemPill, ImageIcon, Styles, ReactMemo } from "#client/utils";
import type { BugFields } from "#services/bugzilla/schema";

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
  }),
);

export default ReactMemo(function Bug({
  fields,
}: ServiceItemProps): ReactResult {
  let classes = useStyles();

  let bug = JSON.parse(fields) as BugFields;

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
