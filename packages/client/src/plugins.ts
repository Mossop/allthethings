import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export interface PluginSettingItem {
  id: string;
  icon: ReactNode;
  label: string;
}

export interface ClientPlugin {
  readonly id: string;
  readonly name: string;

  readonly useSettingsItems: () => PluginSettingItem[];
}

export function usePlugins(): ClientPlugin[] {
  let [plugins, setPlugins] = useState(manager.getPlugins());

  useEffect(() => {
    return manager.listen(() => {
      setPlugins(manager.getPlugins());
    });
  }, []);

  return plugins;
}

export interface ClientPluginManager {
  registerPlugin: (pluginExport: ClientPlugin) => Promise<void>;
}

class PluginManager implements ClientPluginManager {
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
    console.log("register", plugin.id);
    this.plugins.set(plugin.id, plugin);

    for (let listener of this.listeners) {
      listener(plugin);
    }
  }
}

const manager = new PluginManager();
export default manager;
