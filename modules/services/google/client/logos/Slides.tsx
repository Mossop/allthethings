import { SvgIcon } from "@mui/material";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import SlidesIcon from "./Slides.svg";

export default function Icon(): ReactElement {
  return <SvgIcon component={SlidesIcon} viewBox="0 0 48 66" />;
}
