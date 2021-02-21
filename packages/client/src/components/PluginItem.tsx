import type { PluginItem } from "../schema/types";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

interface PluginItemProps {
  item: PluginItem;
}

export default ReactMemo(function NoteItem({
  item: _item,
}: PluginItemProps): ReactResult {
  return <div>item.summary</div>;
});
