import { useUser } from "../utils/globalState";
import { useListInboxQuery } from "./queries";
import type { Item } from "./taskListState";
import { buildItem } from "./taskListState";

export interface InboxContents {
  items: Item[];
}

export function useInboxContents(): InboxContents {
  let { data } = useListInboxQuery({
    pollInterval: 5000,
  });

  let user = useUser();

  if (!data?.user) {
    return {
      items: [],
    };
  }

  return {
    items: data.user.inbox.items.map(buildItem.bind(null, user.inbox)),
  };
}
