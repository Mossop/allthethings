import type { Theme } from "@mui/material";
import type { CSSProperties } from "@mui/styles/withStyles";

const flex: CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  justifyContent: "start",
};

export const flexColumn: CSSProperties = {
  ...flex,
  flexDirection: "column",
};

export const flexRow: CSSProperties = {
  ...flex,
  flexDirection: "row",
};

export const flexCenteredRow: CSSProperties = {
  ...flexRow,
  alignItems: "center",
};

export const flexCentered: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const dragging: CSSProperties = {
  opacity: 0.5,
};

export function pageStyles(theme: Theme): CSSProperties {
  return {
    padding: theme.spacing(3),
    overflowX: "hidden",
    overflowY: "auto",
  };
}
