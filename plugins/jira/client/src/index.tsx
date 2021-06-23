import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, ReactResult } from "@allthethings/ui";

import { SettingsPage, SettingsPages } from "./Settings";

class JiraPlugin implements ClientPlugin {
  public readonly serverId = "@allthethings/jira-server";
  public readonly name = "Jira";

  public renderPluginSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page}/>;
  }

  public renderPluginSettingsPageList(): ReactResult {
    return <SettingsPages/>;
  }

  public renderItem(): ReactResult {
    return null;
  }
}

void PluginManager.registerPlugin(new JiraPlugin());
