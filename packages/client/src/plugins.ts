export interface ClientPlugin {
  readonly id: string;
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

  public async registerPlugin(plugin: ClientPlugin): Promise<void> {
    this.plugins.set(plugin.id, plugin);

    for (let listener of this.listeners) {
      listener(plugin);
    }
  }
}

const manager = new PluginManager();
export default manager;
