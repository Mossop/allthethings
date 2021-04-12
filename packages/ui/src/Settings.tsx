import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import type { ReactElement, ReactNode } from "react";
import { createContext, useCallback, useContext } from "react";

import { Styles } from ".";
import { SelectableListItem } from "./SelectableListItem";
import { flexRow, flexCentered } from "./styles";
import type { ReactResult } from "./types";
import { ReactMemo } from "./types";

export const useIconStyles = makeStyles(() =>
  createStyles({
    iconContainer: {
      width: "1.5rem",
      height: "1.5rem",
      ...Styles.flexCentered,
    },
    icon: {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      objectPosition: "center center",
    },
  }));

export const useSidebarStyles = makeStyles((theme: Theme) =>
  createStyles({
    listitem: {
      ...flexRow,
      alignItems: "center",
    },
    icon: {
      paddingRight: theme.spacing(1),
      minWidth: theme.spacing(1) + 24,
      fontSize: theme.typography.pxToRem(24),
      ...flexCentered,
    },
    selectedItem: {
      backgroundColor: theme.palette.text.secondary,
      color: theme.palette.getContrastText(theme.palette.text.secondary),
    },
  }));

interface SettingsContextProps {
  setPage: (page: string, pluginId?: string) => void;
  page: string;
  pluginId?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SettingsContext = createContext<SettingsContextProps>({
  page: "general",
  setPage: () => {
    // no-op
  },
});

interface SettingsPageIconProps {
  icon?: ReactElement | null | string | URL;
}

const SettingsPageIcon = ReactMemo(function SettingsPageIcon({
  icon,
}: SettingsPageIconProps): ReactResult {
  let classes = useIconStyles();

  if (icon instanceof URL) {
    icon = icon.toString();
  }

  if (typeof icon == "string") {
    return <div className={classes.iconContainer}>
      <img className={classes.icon} src={icon}/>
    </div>;
  } else {
    return icon ?? null;
  }
});

export interface SettingsPageItemProps {
  page?: string;
  pluginId?: string;
  icon?: ReactElement | null | string | URL;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function SettingsPageItem({
  icon,
  page,
  pluginId,
  href,
  onClick,
  children,
}: SettingsPageItemProps): ReactResult {
  let classes = useSidebarStyles();
  let {
    page: currentPage,
    setPage,
  } = useContext(SettingsContext);

  let click = useCallback(() => {
    if (onClick) {
      onClick();
    }

    if (page) {
      setPage(page, pluginId);
    }
  }, [page, pluginId, onClick, setPage]);

  let selected = page == currentPage;

  return <SelectableListItem
    selected={selected}
    className={clsx(classes.listitem, selected && classes.selectedItem)}
    onClick={click}
    iconClassName={classes.icon}
    icon={<SettingsPageIcon icon={icon}/>}
    href={href}
  >
    {children}
  </SelectableListItem>;
}
