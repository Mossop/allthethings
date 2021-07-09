import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import type { ReactNode } from "react";
import { forwardRef } from "react";

import { ReactMemo } from "./types";
import type { ReactResult, ReactRef } from "./types";
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

export const SelectableListItem = ReactMemo(forwardRef(function SelectableListItem(
  {
    selected,
    className,
    icon,
    iconClassName,
    onClick,
    href,
    children,
  }: SelectableListItemProps,
  ref: ReactRef | null,
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
}));
