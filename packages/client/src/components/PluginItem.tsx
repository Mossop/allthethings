import type { ReactResult } from "@allthethings/ui";
import { usePlugin, ReactMemo } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";
import type { PureQueryOptions } from "@apollo/client";
import { useCallback } from "react";

import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { PluginItem } from "../utils/state";
import { isSection } from "../utils/state";
import type { ItemRenderProps } from "./Item";

export type PluginItemProps = Overwrite<ItemRenderProps, {
  item: PluginItem;
}>;

export default ReactMemo(function PluginItem({
  item,
}: PluginItemProps): ReactResult {
  let plugin = usePlugin(item.detail.pluginId);

  let refetchQueries = useCallback((): PureQueryOptions[] => [
    refetchListContextStateQuery(),
    refetchListTaskListQuery({
      taskList: isSection(item.parent) ? item.parent.taskList.id : item.parent.id,
    }),
  ], [item.parent]);

  if (!plugin) {
    return <div>Unknown plugin</div>;
  }

  return plugin.renderItem({
    item,
    refetchQueries,
  });
});
