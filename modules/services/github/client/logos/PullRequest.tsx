import { SvgIcon } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import PullRequestIcon from "./PullRequest.svg";

export default function Icon(): ReactElement {
  return <SvgIcon
    component={PullRequestIcon}
    viewBox="0 0 16 16"
  />;
}
