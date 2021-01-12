import type { CSSProperties } from "@material-ui/core/styles/withStyles";

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
  flexDirection: "column",
};

export const flexCentered: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
