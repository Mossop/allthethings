import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { RevisionStatus } from "conduit-api";

import type { ServiceItemProps, ReactResult } from "../../../client/utils";
import { ItemPill, ImageIcon, Styles, ReactMemo } from "../../../client/utils";
import type { RevisionFields } from "../schema";
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

const StatusMap: Record<RevisionStatus, string> = {
  [RevisionStatus.Draft]: "Draft",
  [RevisionStatus.NeedsReview]: "Needs Review",
  [RevisionStatus.NeedsRevision]: "Needs Revision",
  [RevisionStatus.ChangesPlanned]: "Changes Planned",
  [RevisionStatus.Accepted]: "Ready to Land",
  [RevisionStatus.Closed]: "Landed",
  [RevisionStatus.Abandoned]: "Abandoned",
};

export default ReactMemo(function Revision({
  fields,
}: ServiceItemProps): ReactResult {
  let classes = useStyles();

  let revision = fields as RevisionFields;

  return (
    <a
      className={classes.link}
      rel="noreferrer"
      target="_blank"
      href={revision.uri}
    >
      <div className={classes.iconContainer}>
        <ImageIcon icon={revision.icon ?? <Icon />} />
      </div>
      <div className={classes.summary}>{revision.title}</div>
      <ItemPill border={false}>{StatusMap[revision.status]}</ItemPill>
    </a>
  );
});
