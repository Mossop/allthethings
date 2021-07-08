import type { GoogleFields } from "#plugins/google/schema";
import type { ClientPlugin, PluginItemProps, ReactResult } from "#ui";

import File from "./File";
import { SettingsPage, SettingsPages } from "./Settings";
import Thread from "./Thread";

class GooglePlugin implements ClientPlugin {
  public readonly serverId = "google";
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

export default new GooglePlugin();
