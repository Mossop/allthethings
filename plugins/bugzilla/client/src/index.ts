import type { ClientPlugin } from "@allthethings/types";
import { registerClientPlugin } from "@allthethings/types";

class BugzillaPlugin implements ClientPlugin {
  public readonly id = "bugzilla";
}

registerClientPlugin(new BugzillaPlugin());
