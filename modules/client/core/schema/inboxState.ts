import { useListItems } from "../utils/api";
import { useUser } from "../utils/globalState";
import type { Item } from "./taskListState";
import { buildItem } from "./taskListState";

export interface InboxContents {
  items: Item[];
}

export function useInboxContents(): InboxContents {
  let [items] = useListItems({
    itemFilter: {
      itemHolderId: null,
    },
  });

  let user = useUser();

  if (!items) {
    return {
      items: [],
    };
  }

  return {
    items: items.map(buildItem.bind(null, user.inbox)),
  };
}
