import type { ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";

import type { Link } from "../utils/state";

interface LinkItemProps {
  item: Link;
}

export default ReactMemo(function LinkItem({
  item: _item,
}: LinkItemProps): ReactResult {
  return <div>item.summary</div>;
});
