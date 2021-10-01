import type { Theme } from "@material-ui/core";
import {
  createStyles,
  makeStyles,
  List,
  ListSubheader,
  ListItem,
} from "@material-ui/core";
import clsx from "clsx";
import type { ReactElement, ReactNode } from "react";
import { createContext, useCallback, useContext } from "react";

import { ImageIcon } from "./ImageIcon";
import { SelectableListItem } from "./SelectableListItem";
import { flexCenteredRow, flexColumn, flexCentered } from "./styles";
import type { ReactChildren, ReactResult } from "./types";
import { ReactMemo } from "./types";

export const useSidebarStyles = makeStyles((theme: Theme) =>
  createStyles({
    listitem: {
      ...flexCenteredRow,
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
  }),
);

export const useSettingsPageStyles = makeStyles((theme: Theme) =>
  createStyles({
    page: flexColumn,
    heading: {
      ...flexCenteredRow,
      paddingBottom: theme.spacing(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
    },
    section: {
      paddingLeft: theme.spacing(2),
    },
    sectionHeading: {
      ...flexCenteredRow,
      color: theme.palette.text.primary,
      paddingBottom: theme.spacing(1),
      paddingTop: theme.spacing(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
    },
    listItem: {
      ...flexCenteredRow,
      fontSize: "1.1rem",
      "&:hover": {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
      },
    },
  }),
);

type SetSettingsPage = (page: string, serviceId?: string) => void;

interface SettingsContextProps {
  setPage: SetSettingsPage;
  page: string;
  serviceId?: string;
}

export const SettingsContext = createContext<SettingsContextProps>({
  page: "general",
  setPage: () => {
    // no-op
  },
});

export function useSetSettingsPage(): SetSettingsPage {
  let { setPage } = useContext(SettingsContext);

  return setPage;
}

export interface SettingsPageProps {
  heading: ReactNode;
}

export const SettingsPage = ReactMemo(function SettingsPage({
  heading,
  children,
}: SettingsPageProps & ReactChildren): ReactResult {
  let classes = useSettingsPageStyles();

  return (
    <div className={classes.page}>
      <div className={classes.heading}>{heading}</div>
      <List disablePadding={true}>{children}</List>
    </div>
  );
});

export interface SettingsListSectionProps {
  heading: ReactNode;
}

export const SettingsListSection = ReactMemo(function SettingsListSection({
  heading,
  children,
}: SettingsListSectionProps & ReactChildren): ReactResult {
  let classes = useSettingsPageStyles();

  return (
    <List disablePadding={true} className={classes.section}>
      <ListSubheader disableGutters={true} className={classes.sectionHeading}>
        {heading}
      </ListSubheader>
      {children}
    </List>
  );
});

export const SettingsListItem = ReactMemo(function SettingsListItem({
  children,
}: ReactChildren): ReactResult {
  let classes = useSettingsPageStyles();

  return (
    <ListItem className={classes.listItem} disableGutters={true}>
      {children}
    </ListItem>
  );
});

export interface SettingsPageItemProps {
  page?: string;
  serviceId?: string;
  icon?: ReactElement | null | string | URL;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}

export const SettingsPageItem = ReactMemo(function SettingsPageItem({
  icon,
  page,
  serviceId,
  href,
  onClick,
  children,
}: SettingsPageItemProps): ReactResult {
  let classes = useSidebarStyles();
  let { page: currentPage, setPage } = useContext(SettingsContext);

  let click = useCallback(() => {
    if (onClick) {
      onClick();
    }

    if (page) {
      setPage(page, serviceId);
    }
  }, [page, serviceId, onClick, setPage]);

  let selected = page == currentPage;

  return (
    <SelectableListItem
      selected={selected}
      className={clsx(classes.listitem, selected && classes.selectedItem)}
      onClick={click}
      iconClassName={classes.icon}
      icon={icon && <ImageIcon icon={icon} />}
      href={href}
    >
      {children}
    </SelectableListItem>
  );
});
