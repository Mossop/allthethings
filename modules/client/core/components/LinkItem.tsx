import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import type { Overwrite } from "../../../utils";
import type { ReactResult } from "../../utils";
import { ItemPill, Styles, Icons, ReactMemo } from "../../utils";
import type { LinkItem } from "../schema";
import type { ItemRenderProps } from "./Item";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      ...Styles.flexCenteredRow,
      flex: 1,
      cursor: "pointer",
      overflow: "hidden",
    },
    iconContainer: {
      paddingLeft: `calc(${theme.spacing(1)} + 2px)`,
      paddingRight: `calc(${theme.spacing(1)} + 2px)`,
      ...Styles.flexCentered,
    },
    favicon: {
      width: "1.5rem",
      height: "1.5rem",
    },
    summary: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  }),
);

export type LinkItemProps = Overwrite<
  ItemRenderProps,
  {
    item: LinkItem;
  }
>;

export default ReactMemo(function LinkItem({
  item,
}: LinkItemProps): ReactResult {
  let classes = useStyles();
  let url = new URL(item.detail.url);

  return (
    <a
      className={classes.link}
      rel="noreferrer"
      target="_blank"
      href={item.detail.url}
    >
      <div className={classes.iconContainer}>
        {item.detail.icon ? (
          <img className={classes.favicon} src={item.detail.icon} />
        ) : (
          <Icons.Link />
        )}
      </div>
      <div className={classes.summary}>{item.summary}</div>
      <ItemPill>{url.hostname}</ItemPill>
    </a>
  );
});
