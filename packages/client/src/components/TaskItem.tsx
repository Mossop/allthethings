import IconButton from "@material-ui/core/IconButton";

import type { Task } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { CheckedIcon, UncheckedIcon } from "./Icons";

interface TaskItemProps {
  item: Task;
}

export default ReactMemo(function TaskItem({
  item,
}: TaskItemProps): ReactResult {
  return <>
    <IconButton>
      {item.done ? <CheckedIcon/> : <UncheckedIcon/>}
    </IconButton>
    <div>{item.summary}</div>
  </>;
});
