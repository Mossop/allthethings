import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItem, ReactResult } from "@allthethings/ui";

import Bug from "./Bug";
import { SettingSections } from "./Settings";

export interface BugRecord {
  accountId: string;
  bugId: number;
  summary: string;
  url: string;
}

class BugzillaPlugin implements ClientPlugin {
  public readonly serverId = "@allthethings/bugzilla-server";
  public readonly name = "Bugzilla";

  public renderPluginSections(): ReactResult {
    return <SettingSections/>;
  }

  public renderItem(item: PluginItem): ReactResult {
    return <Bug item={item}/>;
  }
}

void PluginManager.registerPlugin(new BugzillaPlugin());
