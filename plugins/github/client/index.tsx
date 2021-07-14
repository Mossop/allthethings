import type { ClientPlugin, PluginItemProps, ReactResult } from "#client-utils";
import type { IssueFields } from "#plugins/github/schema";

import Issue from "./Issue";
import { SettingsPage, SettingsPages } from "./Settings";

class GithubPlugin implements ClientPlugin {
  public readonly serverId = "github";
  public readonly name = "GitHub";

  public renderPluginSettingsPageList(): ReactResult {
    return <SettingsPages/>;
  }

  public renderPluginSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page}/>;
  }

  public renderItem(itemProps: PluginItemProps): ReactResult {
    let fields: IssueFields = JSON.parse(itemProps.fields);
    return <Issue issue={fields}/>;
  }
}

export default new GithubPlugin();
