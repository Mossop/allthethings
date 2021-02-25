import type { ClientPlugin, PluginSettingItem } from "@allthethings/client";
import { PluginManager } from "@allthethings/client";

import Icon from "./Icon";

class BugzillaPlugin implements ClientPlugin {
  public readonly id = "bugzilla";
  public readonly name = "Bugzilla";

  public useSettingsItems(): PluginSettingItem[] {
    return [{
      id: "addaccount",
      label: "Add Account",
      icon: <Icon/>,
    }];
  }
}

console.log("Start");
void PluginManager.registerPlugin(new BugzillaPlugin());
