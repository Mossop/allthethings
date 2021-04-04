import type { PluginItem, ReactResult } from "@allthethings/ui";
import { Icons, ReactMemo } from "@allthethings/ui";

interface BugRecord {
  accountId: string;
  bugId: number;
  summary: string;
}

export interface BugProps {
  item: PluginItem;
}

export default ReactMemo(function Bug({
  item,
}: BugProps): ReactResult {
  let bug = JSON.parse(item.detail.fields) as BugRecord;

  return <>
    {item.taskInfo?.done && <Icons.Checked/>}
    {item.taskInfo && !item.taskInfo.done && <Icons.Unchecked/>}
    <div>{bug.summary}</div>
  </>;
});
