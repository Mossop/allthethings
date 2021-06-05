import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";

import DocsIcon from "./logos/Docs";
import DriveIcon from "./logos/Drive";
import SheetsIcon from "./logos/Sheets";
import SlidesIcon from "./logos/Slides";

interface FileIconProps {
  mimeType: string;
}

export default ReactMemo(function FileIcon({
  mimeType,
}: FileIconProps): ReactResult {
  switch (mimeType) {
    case "application/vnd.google-apps.document":
      return <DocsIcon/>;
    case "application/vnd.google-apps.spreadsheet":
      return <SheetsIcon/>;
    case "application/vnd.google-apps.presentation":
      return <SlidesIcon/>;
    default:
      return <DriveIcon/>;
  }
});
