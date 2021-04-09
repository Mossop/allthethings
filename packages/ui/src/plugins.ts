import type { Overwrite } from "@allthethings/utils";
import type { PureQueryOptions } from "@apollo/client";
import { useMemo, useEffect, useState } from "react";

import type { Item } from "./schema";
import type * as Schema from "./schema/types";
import type { ReactResult } from "./types";

export type PluginItem = Overwrite<Item, {
  detail: Schema.PluginDetail;
}>;

export interface PluginItemProps {
  item: PluginItem;
  refetchQueries: () => PureQueryOptions[];
}

export interface ClientPlugin {
  readonly serverId: string;
  readonly name: string;

  readonly renderPluginSections: () => ReactResult;
  readonly renderItem: (itemProps: PluginItemProps) => ReactResult;
}

export function usePlugins(): ClientPlugin[] {
  let [plugins, setPlugins] = useState(PluginManager.getPlugins());

  useEffect(() => {
    return PluginManager.listen(() => {
      setPlugins(PluginManager.getPlugins());
    });
  }, []);

  return plugins;
}

export function usePlugin(id: string): ClientPlugin | null {
  let plugins = usePlugins();

  return useMemo(() => {
    for (let plugin of plugins) {
      if (plugin.serverId == id) {
        return plugin;
      }
    }

    return null;
  }, [plugins, id]);
}

export interface ClientPluginManager {
  registerPlugin: (pluginExport: ClientPlugin) => Promise<void>;
}

class PluginManagerImpl implements ClientPluginManager {
  private plugins: Map<string, ClientPlugin> = new Map();
  private listeners: Set<(plugin: ClientPlugin) => void> = new Set();
  private staticPlugins: ClientPlugin[] | null = null;

  public listen(listener: (plugin: ClientPlugin) => void): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  public getPlugins(): ClientPlugin[] {
    if (!this.staticPlugins) {
      this.staticPlugins = [...this.plugins.values()];
    }
    return this.staticPlugins;
  }

  public async registerPlugin(plugin: ClientPlugin): Promise<void> {
    this.plugins.set(plugin.serverId, plugin);
    this.staticPlugins = null;

    for (let listener of this.listeners) {
      listener(plugin);
    }
  }
}

export const PluginManager = new PluginManagerImpl();
