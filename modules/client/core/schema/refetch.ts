import type { RefetchQueries } from "#client/utils";

import type { Inbox, TaskList } from "./contextState";
import { isInbox } from "./contextState";
import { refetchListInboxQuery, refetchListTaskListQuery } from "./operations";
import type { Item, Section } from "./taskListState";
import { sectionTaskList } from "./taskListState";

export function refetchQueriesForSection(
  section: Inbox | Section | TaskList,
): RefetchQueries {
  let refetchQueries: RefetchQueries = [];

  let taskList = sectionTaskList(section);

  if (isInbox(taskList)) {
    refetchQueries.push(refetchListInboxQuery());
  } else {
    refetchQueries.push(
      refetchListTaskListQuery({
        taskList: taskList.id,
      }),
    );
  }

  return refetchQueries;
}

export function refetchQueriesForItem(item: Item): RefetchQueries {
  return refetchQueriesForSection(item.parent);
}
