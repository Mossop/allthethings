import type { File } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

interface FileItemProps {
  item: File;
}

export default ReactMemo(function FileItem({
  item: _item,
}: FileItemProps): ReactResult {
  return <div>item.summary</div>;
});
