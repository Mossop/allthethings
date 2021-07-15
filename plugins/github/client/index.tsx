import type { ClientPlugin, PluginItemProps, ReactResult } from "#client-utils";
import type { IssueLikeFields } from "#plugins/github/schema";

import IssueLike from "./IssueLike";
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
    let fields: IssueLikeFields = JSON.parse(itemProps.fields);
    return <IssueLike issueLike={fields}/>;
  }
}

export default new GithubPlugin();
