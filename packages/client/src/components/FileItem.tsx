import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";

import type { File } from "../utils/state";

interface FileItemProps {
  item: File;
}

export default ReactMemo(function FileItem({
  item: _item,
}: FileItemProps): ReactResult {
  return <div>item.summary</div>;
});
