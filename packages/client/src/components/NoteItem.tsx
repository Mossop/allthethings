import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";

import type { Note } from "../utils/state";

interface NoteItemProps {
  item: Note;
}

export default ReactMemo(function NoteItem({
  item: _item,
}: NoteItemProps): ReactResult {
  return <div>item.summary</div>;
});
