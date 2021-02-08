import type { Link } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

interface LinkItemProps {
  item: Link;
}

export default ReactMemo(function LinkItem({
  item: _item,
}: LinkItemProps): ReactResult {
  return <div>item.summary</div>;
});
