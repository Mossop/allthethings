import { useCallback } from "react";

import type { ReactResult } from "#client-utils";
import { ItemPill, usePlugin, ReactMemo } from "#client-utils";
import type { Overwrite } from "#utils";

import { refetchQueriesForItem } from "../schema";
import type { PluginItem, PluginList as PluginListSchema } from "../schema";
import type { ItemRenderProps } from "./Item";

export type PluginItemProps = Overwrite<ItemRenderProps, {
  item: PluginItem;
}>;

export default ReactMemo(function PluginItem({
  item,
}: PluginItemProps): ReactResult {
  let plugin = usePlugin(item.detail.pluginId);

  let refetchQueries = useCallback(() => refetchQueriesForItem(item), [item]);

  if (!plugin) {
    return <div>Unknown plugin</div>;
  }

  return <>
    {
      plugin.renderItem({
        fields: item.detail.fields,
        refetchQueries,
      })
    }
    {
      item.detail.lists.map((list: PluginListSchema) => <ItemPill
        key={list.id}
        url={list.url}
      >
        {list.name}
      </ItemPill>)
    }
  </>;
});
