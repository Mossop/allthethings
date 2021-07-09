import type { ClientPlugin, PluginItemProps, ReactResult } from "#client-utils";

import Revision from "./Revision";
import { SettingsPages, SettingsPage } from "./Settings";

class BugzillaPlugin implements ClientPlugin {
  public readonly serverId = "phabricator";
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

export default new BugzillaPlugin();
