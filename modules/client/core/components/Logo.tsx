import type { SvgIconProps } from "@mui/material";
import { SvgIcon } from "@mui/material";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import LogoIcon from "../../../../logo.svg";

export default function Icon(props: SvgIconProps): ReactElement {
  return <SvgIcon component={LogoIcon} viewBox="0 0 12.6 12.6" {...props} />;
}
