import type { ClientPlugin, ClientPluginExport } from "@allthethings/types";

import { resolvePlugin } from "@allthethings/utils";

class PluginManager {
  private plugins: Set<ClientPlugin> = new Set();
  private listeners: Set<(plugin: ClientPlugin) => void> = new Set();

  public listen(listener: (plugin: ClientPlugin) => void): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  public async registerPlugin(pluginExport: ClientPluginExport): Promise<void> {
    let plugin = await resolvePlugin(pluginExport, null);
    this.plugins.add(plugin);

    for (let listener of this.listeners) {
      listener(plugin);
    }
  }
}

const manager = new PluginManager();
export default manager;
