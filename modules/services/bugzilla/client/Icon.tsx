import { SvgIcon } from "@mui/material";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import BugIcon from "./Icon.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={BugIcon} viewBox="0 0 90 90" />;
}
