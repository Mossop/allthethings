import type { SvgIconProps } from "@material-ui/core";
import { SvgIcon } from "@material-ui/core";
import type { ReactElement } from "react";

// @ts-ignore: SVG Icon.
import LogoIcon from "../../../../logo.svg";

export default function Icon(props: SvgIconProps): ReactElement {
  return <SvgIcon component={LogoIcon} viewBox="0 0 12.6 12.6" {...props} />;
}
