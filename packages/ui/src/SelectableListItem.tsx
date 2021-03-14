import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import type { ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";

import type { ReactResult } from "./types";
import { pushClickedLink } from "./url";

export interface SelectableListItemProps {
  selected: boolean;
  className?: string;
  icon?: ReactNode;
  iconClassName?: string;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}

export const SelectableListItem = forwardRef(function SelectableListItem(
  {
    selected,
    className,
    icon,
    iconClassName,
    onClick,
    href,
    children,
  }: SelectableListItemProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: ForwardedRef<any>,
): ReactResult {
  if (selected) {
    return <ListItem
      ref={ref}
      dense={true}
      className={className}
      component="div"
    >
      <ListItemIcon className={iconClassName}>{icon}</ListItemIcon>
      <ListItemText>{children}</ListItemText>
    </ListItem>;
  } else if (href) {
    return <ListItem
      ref={ref}
      dense={true}
      button={true}
      className={className}
      component="a"
      href={href}
      onClick={pushClickedLink}
    >
      <ListItemIcon className={iconClassName}>{icon}</ListItemIcon>
      <ListItemText>{children}</ListItemText>
    </ListItem>;
  } else {
    return <ListItem
      ref={ref}
      dense={true}
      button={true}
      className={className}
      onClick={onClick}
    >
      <ListItemIcon className={iconClassName}>{icon}</ListItemIcon>
      <ListItemText>{children}</ListItemText>
    </ListItem>;
  }
});