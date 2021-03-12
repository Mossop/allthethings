import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";

import type { NoteItem } from "../utils/state";

interface NoteItemProps {
  item: NoteItem;
}

export default ReactMemo(function NoteItem({
  item: _item,
}: NoteItemProps): ReactResult {
  return <div>item.summary</div>;
});
