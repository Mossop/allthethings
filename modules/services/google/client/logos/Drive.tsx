import { SvgIcon } from "@mui/material";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import DriveIcon from "./Drive.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={DriveIcon} viewBox="0 0 87.3 78" />;
}
