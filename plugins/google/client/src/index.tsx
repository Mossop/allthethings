import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItemProps, ReactResult } from "@allthethings/ui";

import { SettingsPages } from "./Settings";

class GooglePlugin implements ClientPlugin {
  public readonly serverId = "@allthethings/google-server";
  public readonly name = "Google";

  public renderPluginSettingsPageList(): ReactResult {
    return <SettingsPages/>;
  }

  public renderItem(_itemProps: PluginItemProps): ReactResult {
    return null;
  }
}

void PluginManager.registerPlugin(new GooglePlugin());
