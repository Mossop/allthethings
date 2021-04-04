import type { PluginItem, ReactResult } from "@allthethings/ui";
import { Styles, Icons, ReactMemo } from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core";

import type { BugRecord } from ".";
import Icon from "./Icon";

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

export interface BugProps {
  item: PluginItem;
}

export default ReactMemo(function Bug({
  item,
}: BugProps): ReactResult {
  let classes = useStyles();

  let bug = JSON.parse(item.detail.fields) as BugRecord;

  return <>
    {item.taskInfo?.done && <Icons.Checked/>}
    {item.taskInfo && !item.taskInfo.done && <Icons.Unchecked/>}
    <a className={classes.link} rel="noreferrer" target="_blank" href={bug.url}>
      <div className={classes.iconContainer}>
        <Icon/>
      </div>
      <div>{bug.summary}</div>
    </a>
  </>;
});
