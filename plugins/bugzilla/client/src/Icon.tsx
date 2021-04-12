import { SvgIcon } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import BugIcon from "./Icon.svg";

export default function Icon(): ReactElement {
  return <SvgIcon
    component={BugIcon}
    viewBox="0 9 95 134"
  />;
}
