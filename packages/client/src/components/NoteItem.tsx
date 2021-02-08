import type { Note } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

interface NoteItemProps {
  item: Note;
}

export default ReactMemo(function NoteItem({
  item: _item,
}: NoteItemProps): ReactResult {
  return <div>item.summary</div>;
});
