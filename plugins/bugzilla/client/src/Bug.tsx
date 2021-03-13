import type { PluginItem, ReactResult } from "@allthethings/ui";
import { Icons, ReactMemo } from "@allthethings/ui";

export interface BugProps {
  item: PluginItem;
}

export default ReactMemo(function Bug({
  item,
}: BugProps): ReactResult {
  return <>
    {item.taskInfo?.done && <Icons.CheckedIcon/>}
    {item.taskInfo && !item.taskInfo.done && <Icons.UncheckedIcon/>}
    <div>{item.summary}</div>
  </>;
});
