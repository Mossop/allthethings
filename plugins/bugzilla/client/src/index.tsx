import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItemProps, ReactResult } from "@allthethings/ui";

import Bug from "./Bug";
import { SettingsSections, SettingsSection } from "./Settings";

class BugzillaPlugin implements ClientPlugin {
  public readonly serverId = "@allthethings/bugzilla-server";
  public readonly name = "Bugzilla";

  public renderPluginSettingsSections(): ReactResult {
    return <SettingsSections/>;
  }

  public renderPluginSettingsSection(section: string): ReactResult {
    return <SettingsSection section={section}/>;
  }

  public renderItem(itemProps: PluginItemProps): ReactResult {
    return <Bug {...itemProps}/>;
  }
}

void PluginManager.registerPlugin(new BugzillaPlugin());
