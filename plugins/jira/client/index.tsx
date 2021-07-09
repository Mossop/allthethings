import type { IssueFields } from "#plugins/jira/schema";
import type { ClientPlugin, ReactResult, PluginItemProps } from "#client-utils";

import Issue from "./Issue";
import { SettingsPage, SettingsPages } from "./Settings";

class JiraPlugin implements ClientPlugin {
  public readonly serverId = "jira";
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

export default new JiraPlugin();
