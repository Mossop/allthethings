import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext } from "react";

import { SelectableListItem } from "./SelectableListItem";
import { flexRow, flexCentered } from "./styles";
import type { ReactResult } from "./types";

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
  setSection: (section: string) => void;
  section: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SectionContext = createContext<SectionContextProps>({
  section: "general",
  setSection: () => {
    // no-op
  },
});

export interface SettingSectionProps {
  sectionId?: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function SettingSection({
  icon,
  sectionId,
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
      setSection(sectionId);
    }
  }, [sectionId, onClick, setSection]);

  let selected = section == sectionId;

  return <SelectableListItem
    selected={selected}
    className={clsx(classes.listitem, selected && classes.selectedItem)}
    onClick={click}
    iconClassName={classes.icon}
    icon={icon}
    href={href}
  >
    {children}
  </SelectableListItem>;
}
