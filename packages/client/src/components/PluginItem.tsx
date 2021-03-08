import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";

import type { PluginItem } from "../utils/state";

interface PluginItemProps {
  item: PluginItem;
}

export default ReactMemo(function NoteItem({
  item: _item,
}: PluginItemProps): ReactResult {
  return <div>item.summary</div>;
});
