import type { ClientPlugin, PluginItemProps, ReactResult } from "#client-utils";

import Bug from "./Bug";
import { SettingsPages, SettingsPage } from "./Settings";

class BugzillaPlugin implements ClientPlugin {
  public readonly serverId = "bugzilla";
  public readonly name = "Bugzilla";

  public renderPluginSettingsPageList(): ReactResult {
    return <SettingsPages/>;
  }

  public renderPluginSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page}/>;
  }

  public renderItem(itemProps: PluginItemProps): ReactResult {
    return <Bug {...itemProps}/>;
  }
}

export default new BugzillaPlugin();
