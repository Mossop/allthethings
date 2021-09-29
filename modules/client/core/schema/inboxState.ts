import { api, queryHook } from "../../utils";
import { useUser } from "../utils/globalState";
import type { Item } from "./taskListState";
import { buildItem } from "./taskListState";

export interface InboxContents {
  items: Item[];
}

const useListItems = queryHook(api.item.listItems, {
  pollInterval: 60000,
});

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
