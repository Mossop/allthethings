import { SvgIcon } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import GoogleIcon from "./Google.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={GoogleIcon} viewBox="0 0 48 48" />;
}
