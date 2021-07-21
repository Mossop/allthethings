import type { ClientService, ServiceItemProps, ReactResult } from "#client/utils";

import Bug from "./Bug";
import { SettingsPages, SettingsPage } from "./Settings";

class BugzillaService implements ClientService {
  public readonly serverId = "bugzilla";
  public readonly name = "Bugzilla";

  public renderServiceSettingsPageList(): ReactResult {
    return <SettingsPages/>;
  }

  public renderServiceSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page}/>;
  }

  public renderItem(itemProps: ServiceItemProps): ReactResult {
    return <Bug {...itemProps}/>;
  }
}

export default new BugzillaService();
