import type { Overwrite } from "../../../utils";
import type { ReactResult } from "../../utils";
import { ItemPill, useService, ReactMemo } from "../../utils";
import type { ServiceItem, ServiceList as ServiceListSchema } from "../schema";
import type { ItemRenderProps } from "./Item";

export type ServiceItemProps = Overwrite<
  ItemRenderProps,
  {
    item: ServiceItem;
  }
>;

export default ReactMemo(function ServiceItem({
  item,
}: ServiceItemProps): ReactResult {
  let service = useService(item.detail.serviceId);

  if (!service) {
    return <div>Unknown service</div>;
  }

  return (
    <>
      {service.renderItem({
        fields: item.detail.fields,
      })}
      {item.detail.lists.map((list: ServiceListSchema) => (
        <ItemPill key={list.id} url={list.url}>
          {list.name}
        </ItemPill>
      ))}
    </>
  );
});
