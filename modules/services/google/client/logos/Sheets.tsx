import { SvgIcon } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import SheetsIcon from "./Sheets.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={SheetsIcon} viewBox="0 0 49 67" />;
}
