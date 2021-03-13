import type { ReactResult } from "@allthethings/ui";
import { usePlugin, ReactMemo } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";

import type { PluginItem } from "../utils/state";
import type { ItemRenderProps } from "./Item";

export type PluginItemProps = Overwrite<ItemRenderProps, {
  item: PluginItem;
}>;

export default ReactMemo(function NoteItem({
  item,
}: PluginItemProps): ReactResult {
  let plugin = usePlugin(item.detail.pluginId);

  if (!plugin) {
    return <div>Unknown plugin</div>;
  }

  return plugin.renderItem(item);
});
