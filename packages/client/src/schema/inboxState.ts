import { useView } from "../utils/view";
import { useListInboxQuery } from "./queries";
import type { Item } from "./taskListState";
import { buildItem } from "./taskListState";

export interface InboxContents {
  items: Item[];
}

export function useInboxContents(): InboxContents {
  let { data } = useListInboxQuery({
    pollInterval: 30000,
  });

  let view = useView();

  if (!data?.user) {
    return {
      items: [],
    };
  }

  return {
    items: data.user.inbox.items.items.map(buildItem.bind(null, view.user.inbox)),
  };
}
