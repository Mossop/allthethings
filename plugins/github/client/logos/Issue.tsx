import { SvgIcon } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import IssueIcon from "./Issue.svg";

export default function Icon(): ReactElement {
  return <SvgIcon
    component={IssueIcon}
    viewBox="0 0 24 24"
  />;
}
