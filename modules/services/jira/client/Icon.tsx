import { SvgIcon } from "@mui/material";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import JiraIcon from "./Icon.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={JiraIcon} viewBox="0 0 80.000001 79.999998" />;
}
