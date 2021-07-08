import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import type { FileFields } from "#plugins/google/schema";
import type { ReactResult } from "#ui";
import { Styles, ReactMemo } from "#ui";

import FileIcon from "./FileIcon";

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

export interface FileProps {
  file: FileFields;
}

export default ReactMemo(function File({
  file,
}: FileProps): ReactResult {
  let classes = useStyles();

  return <a className={classes.link} rel="noreferrer" target="_blank" href={file.url ?? ""}>
    <div className={classes.iconContainer}>
      <FileIcon mimeType={file.mimeType}/>
    </div>
    <div className={classes.name}>{file.name}</div>
  </a>;
});
