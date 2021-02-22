import type { ClientPlugin } from "@allthethings/client";
import { PluginManager } from "@allthethings/client";

class BugzillaPlugin implements ClientPlugin {
  public readonly id = "bugzilla";
}

void PluginManager.registerPlugin(new BugzillaPlugin());
