import type { ClientPlugin } from "@allthethings/client";
import { PluginManager, SettingSection } from "@allthethings/client";
import type { ReactNode } from "react";

import Icon from "./Icon";

class BugzillaPlugin implements ClientPlugin {
  public readonly id = "bugzilla";
  public readonly name = "Bugzilla";

  public renderPluginSections(): ReactNode {
    return <SettingSection
      icon={<Icon/>}
    >
      Add Account
    </SettingSection>;
  }
}

void PluginManager.registerPlugin(new BugzillaPlugin());
