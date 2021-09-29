import type {
  ClientService,
  ServiceItemProps,
  ReactResult,
} from "../../../client/utils";
import type { GoogleFields } from "../schema";
import File from "./File";
import { SettingsPage, SettingsPages } from "./Settings";
import Thread from "./Thread";

class GoogleService implements ClientService {
  public readonly serverId = "google";
  public readonly name = "Google";

  public renderServiceSettingsPageList(): ReactResult {
    return <SettingsPages />;
  }

  public renderServiceSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page} />;
  }

  public renderItem(itemProps: ServiceItemProps): ReactResult {
    let fields: GoogleFields = itemProps.fields as GoogleFields;
    if (fields.type == "file") {
      return <File file={fields} />;
    }
    return <Thread thread={fields} />;
  }
}

export default new GoogleService();
