import { DateTime } from "luxon";

import type { Item } from "../schema";

export interface ListFilter {
  snoozed: boolean;
  archived: boolean;
  complete: boolean;
}

export const Filters: Record<string, ListFilter> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Normal: {
    snoozed: false,
    archived: false,
    complete: false,
  },
};

export function isVisible(item: Item, filter: ListFilter): boolean {
  if (item.taskInfo?.done) {
    return filter.complete;
  }

  if (item.archived) {
    return filter.archived;
  }

  if (item.snoozed && item.snoozed > DateTime.now()) {
    return filter.snoozed;
  }

  return true;
}
