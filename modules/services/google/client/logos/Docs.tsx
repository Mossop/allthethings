import { SvgIcon } from "@mui/material";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import DocsIcon from "./Docs.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={DocsIcon} viewBox="0 0 47 65" />;
}
