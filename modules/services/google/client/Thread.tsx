import UnreadMailIcon from "@mui/icons-material/Mail";
import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import type { ReactResult } from "../../../client/utils";
import { ItemPill, Styles, ReactMemo } from "../../../client/utils";
import type { ThreadFields } from "../schema";
import GmailIcon from "./logos/Gmail";

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
    subject: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  }),
);

export interface FileProps {
  thread: ThreadFields;
}

export default ReactMemo(function Thread({ thread }: FileProps): ReactResult {
  let classes = useStyles();

  return (
    <>
      <a
        className={classes.link}
        rel="noreferrer"
        target="_blank"
        href={thread.url}
      >
        <div className={classes.iconContainer}>
          <GmailIcon />
        </div>
        <div className={classes.subject}>{thread.subject}</div>
      </a>
      {thread.unread && <UnreadMailIcon />}
      {thread.labels.map((label: string) => (
        <ItemPill key={label}>{label}</ItemPill>
      ))}
    </>
  );
});
