import type { ReactResult } from "@allthethings/ui";
import { Styles, Icons, ReactMemo } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import type { LinkItem } from "../utils/state";
import { isTask } from "../utils/state";
import type { ItemRenderProps } from "./Item";
import TaskDoneToggle from "./TaskDoneToggle";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      ...Styles.flexRow,
      alignItems: "center",
      flex: 1,
      cursor: "pointer",
    },
    iconContainer: {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      ...Styles.flexCentered,
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
    {isTask(item) && <TaskDoneToggle item={item}/>}
    <a className={classes.link} rel="noreferrer" target="_blank" href={item.detail.url}>
      <div className={classes.iconContainer}>
        {
          item.detail.icon
            ? <img src={item.detail.icon}/>
            : <Icons.Link/>
        }
      </div>
    </a>
    <div>{item.summary}</div>
  </>;
});
