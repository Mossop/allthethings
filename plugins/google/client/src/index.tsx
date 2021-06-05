import type { GoogleFields } from "@allthethings/google-server";
import { PluginManager } from "@allthethings/ui";
import type { ClientPlugin, PluginItemProps, ReactResult } from "@allthethings/ui";

import File from "./File";
import { SettingsPage, SettingsPages } from "./Settings";

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
    let fields: GoogleFields = JSON.parse(itemProps.item.detail.fields);
    return <File item={itemProps.item} file={fields}/>;
  }
}

void PluginManager.registerPlugin(new GooglePlugin());
