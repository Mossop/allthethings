import IconButton from "@material-ui/core/IconButton";
import { DateTime } from "luxon";
import { useCallback } from "react";

import { useEditTaskMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { Section, Task, TaskList } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { CheckedIcon, UncheckedIcon } from "./Icons";

interface TaskItemProps {
  taskList: TaskList;
  section: Section | null;
  item: Task;
}

export default ReactMemo(function TaskItem({
  taskList,
  item,
}: TaskItemProps): ReactResult {
  let [toggleDone] = useEditTaskMutation({
    refetchQueries: [
      refetchListContextStateQuery(),
      refetchListTaskListQuery({
        taskList: taskList.id,
      }),
    ],
  });

  let toggle = useCallback(() => toggleDone({
    variables: {
      id: item.id,
      params: {
        link: item.link,
        archived: item.archived,
        summary: item.summary,
        due: item.due,
        done: item.done ? null : DateTime.utc(),
      },
    },
  }), [item, toggleDone]);

  return <>
    <IconButton onClick={toggle}>
      {item.done ? <CheckedIcon/> : <UncheckedIcon/>}
    </IconButton>
    <div>{item.summary}</div>
  </>;
});
