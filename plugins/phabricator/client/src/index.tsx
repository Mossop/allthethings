import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItemProps, ReactResult } from "@allthethings/ui";

import Revision from "./Revision";
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

  public renderItem(itemProps: PluginItemProps): ReactResult {
    return <Revision {...itemProps}/>;
  }
}

void PluginManager.registerPlugin(new BugzillaPlugin());
