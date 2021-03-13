import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItem, ReactResult } from "@allthethings/ui";

import Bug from "./Bug";
import { SettingSections } from "./Settings";

class BugzillaPlugin implements ClientPlugin {
  public readonly id = "bugzilla";
  public readonly name = "Bugzilla";

  public renderPluginSections(): ReactResult {
    return <SettingSections/>;
  }

  public renderItem(item: PluginItem): ReactResult {
    return <Bug item={item}/>;
  }
}

void PluginManager.registerPlugin(new BugzillaPlugin());
