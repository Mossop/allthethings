import type { PureQueryOptions } from "@apollo/client";

import type { Inbox, TaskList } from "./contextState";
import { isInbox } from "./contextState";
import {
  refetchListContextStateQuery,
  refetchListInboxQuery,
  refetchListTaskListQuery,
} from "./queries";
import type { Item, Section } from "./taskListState";
import { sectionTaskList } from "./taskListState";

export function refetchQueriesForSection(section: Inbox | Section | TaskList): PureQueryOptions[] {
  let refetchQueries: PureQueryOptions[] = [refetchListContextStateQuery()];

  let taskList = sectionTaskList(section);

  if (isInbox(taskList)) {
    refetchQueries.push(refetchListInboxQuery());
  } else {
    refetchQueries.push(refetchListTaskListQuery({
      taskList: taskList.id,
    }));
  }

  return refetchQueries;
}

export function refetchQueriesForItem(item: Item): PureQueryOptions[] {
  return refetchQueriesForSection(item.parent);
}
