import type { GoogleFields } from "@allthethings/google-server";
import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItemProps, ReactResult } from "@allthethings/ui";

import File from "./File";
import { SettingsPage, SettingsPages } from "./Settings";
import Thread from "./Thread";

class GooglePlugin implements ClientPlugin {
  public readonly serverId = "@allthethings/google-server";
  public readonly name = "Google";

  public renderPluginSettingsPageList(): ReactResult {
    return <SettingsPages/>;
  }

  public renderPluginSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page}/>;
  }

  public renderItem(itemProps: PluginItemProps): ReactResult {
    let fields: GoogleFields = JSON.parse(itemProps.fields);
    if (fields.type == "file") {
      return <File file={fields}/>;
    }
    return <Thread thread={fields}/>;
  }
}

void PluginManager.registerPlugin(new GooglePlugin());
