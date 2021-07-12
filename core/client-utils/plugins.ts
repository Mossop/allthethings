import { useMemo, useEffect, useState } from "react";

import type { ReactResult, RefetchQueries } from "./types";

export type PluginFields = string;

export interface PluginItemProps {
  fields: PluginFields;
  refetchQueries: () => RefetchQueries;
}

export interface ClientPlugin {
  readonly serverId: string;
  readonly name: string;

  readonly renderPluginSettingsPageList?: () => ReactResult;
  readonly renderPluginSettingsPage?: (page: string) => ReactResult;
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
