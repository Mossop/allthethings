import { useCallback } from "react";

import type { ReactResult } from "#client/utils";
import { ItemPill, useService, ReactMemo } from "#client/utils";
import type { Overwrite } from "#utils";

import { refetchQueriesForItem } from "../schema";
import type { ServiceItem, ServiceList as ServiceListSchema } from "../schema";
import type { ItemRenderProps } from "./Item";

export type ServiceItemProps = Overwrite<ItemRenderProps, {
  item: ServiceItem;
}>;

export default ReactMemo(function ServiceItem({
  item,
}: ServiceItemProps): ReactResult {
  let service = useService(item.detail.serviceId);

  let refetchQueries = useCallback(() => refetchQueriesForItem(item), [item]);

  if (!service) {
    return <div>Unknown service</div>;
  }

  return <>
    {
      service.renderItem({
        fields: item.detail.fields,
        refetchQueries,
      })
    }
    {
      item.detail.lists.map((list: ServiceListSchema) => <ItemPill
        key={list.id}
        url={list.url}
      >
        {list.name}
      </ItemPill>)
    }
  </>;
});
