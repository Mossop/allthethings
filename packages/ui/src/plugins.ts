import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export interface ClientPlugin {
  readonly id: string;
  readonly name: string;

  readonly renderPluginSections: () => ReactNode
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

export interface ClientPluginManager {
  registerPlugin: (pluginExport: ClientPlugin) => Promise<void>;
}

class PluginManagerImpl implements ClientPluginManager {
  private plugins: Map<string, ClientPlugin> = new Map();
  private listeners: Set<(plugin: ClientPlugin) => void> = new Set();

  public listen(listener: (plugin: ClientPlugin) => void): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  public getPlugins(): ClientPlugin[] {
    return [...this.plugins.values()];
  }

  public async registerPlugin(plugin: ClientPlugin): Promise<void> {
    this.plugins.set(plugin.id, plugin);

    for (let listener of this.listeners) {
      listener(plugin);
    }
  }
}

export const PluginManager = new PluginManagerImpl();
