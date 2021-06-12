import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItemProps, ReactResult } from "@allthethings/ui";

import { SettingsPages, SettingsPage } from "./Settings";

class BugzillaPlugin implements ClientPlugin {
  public readonly serverId = "@allthethings/phabricator-server";
  public readonly name = "Phabricator";

  public renderPluginSettingsPageList(): ReactResult {
    return <SettingsPages/>;
  }

  public renderPluginSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page}/>;
  }

  public renderItem(_itemProps: PluginItemProps): ReactResult {
    throw new Error("Not implemented");
  }
}

void PluginManager.registerPlugin(new BugzillaPlugin());
