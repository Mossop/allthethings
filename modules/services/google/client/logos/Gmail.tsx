import { SvgIcon } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import GmailIcon from "./Gmail.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={GmailIcon} viewBox="52 42 88 66" />;
}
