import { SvgIcon } from "@mui/material";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import GitHubIcon from "./GitHub.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={GitHubIcon} viewBox="0 0 24 24" />;
}
