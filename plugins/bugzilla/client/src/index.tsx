import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItemProps, ReactResult } from "@allthethings/ui";

import Bug from "./Bug";
import { SettingSections } from "./Settings";

class BugzillaPlugin implements ClientPlugin {
  public readonly serverId = "@allthethings/bugzilla-server";
  public readonly name = "Bugzilla";

  public renderPluginSections(): ReactResult {
    return <SettingSections/>;
  }

  public renderItem(itemProps: PluginItemProps): ReactResult {
    return <Bug {...itemProps}/>;
  }
}

void PluginManager.registerPlugin(new BugzillaPlugin());
