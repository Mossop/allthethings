import type { ReactResult } from "@allthethings/ui";
import { Styles, Icons, ReactMemo, TaskDoneToggle } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import type { LinkItem } from "../utils/state";
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
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
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
  }));

export type LinkItemProps = Overwrite<ItemRenderProps, {
  item: LinkItem;
}>;

export default ReactMemo(function LinkItem({
  item,
}: LinkItemProps): ReactResult {
  let classes = useStyles();

  return <>
    <TaskDoneToggle item={item}/>
    <a className={classes.link} rel="noreferrer" target="_blank" href={item.detail.url}>
      <div className={classes.iconContainer}>
        {
          item.detail.icon
            ? <img className={classes.favicon} src={item.detail.icon}/>
            : <Icons.Link/>
        }
      </div>
      <div className={classes.summary}>{item.summary}</div>
    </a>
  </>;
});
