import type { IssueFields } from "@allthethings/jira-schema";
import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, ReactResult, PluginItemProps } from "@allthethings/ui";

import Issue from "./Issue";
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

  public renderItem(itemProps: PluginItemProps): ReactResult {
    return <Issue issue={JSON.parse(itemProps.fields) as IssueFields}/>;
  }
}

void PluginManager.registerPlugin(new JiraPlugin());
