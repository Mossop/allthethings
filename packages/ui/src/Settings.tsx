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

export const useSectionStyles = makeStyles((theme: Theme) =>
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

interface SectionContextProps {
  setSection: (section: string, pluginId?: string) => void;
  section: string;
  pluginId?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SectionContext = createContext<SectionContextProps>({
  section: "general",
  setSection: () => {
    // no-op
  },
});

interface SettingSectionIconProps {
  icon?: ReactElement | null | string | URL;
}

const SettingSectionIcon = ReactMemo(function SettingSectionIcon({
  icon,
}: SettingSectionIconProps): ReactResult {
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

export interface SettingSectionProps {
  sectionId?: string;
  pluginId?: string;
  icon?: ReactElement | null | string | URL;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function SettingSection({
  icon,
  sectionId,
  pluginId,
  href,
  onClick,
  children,
}: SettingSectionProps): ReactResult {
  let classes = useSectionStyles();
  let {
    section,
    setSection,
  } = useContext(SectionContext);

  let click = useCallback(() => {
    if (onClick) {
      onClick();
    }

    if (sectionId) {
      setSection(sectionId, pluginId);
    }
  }, [sectionId, pluginId, onClick, setSection]);

  let selected = section == sectionId;

  return <SelectableListItem
    selected={selected}
    className={clsx(classes.listitem, selected && classes.selectedItem)}
    onClick={click}
    iconClassName={classes.icon}
    icon={<SettingSectionIcon icon={icon}/>}
    href={href}
  >
    {children}
  </SelectableListItem>;
}
