import type {
  ClientService,
  ServiceItemProps,
  ReactResult,
} from "../../../client/utils";
import Revision from "./Revision";
import { SettingsPages, SettingsPage } from "./Settings";

class BugzillaService implements ClientService {
  public readonly serverId = "phabricator";
  public readonly name = "Phabricator";

  public renderServiceSettingsPageList(): ReactResult {
    return <SettingsPages />;
  }

  public renderServiceSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page} />;
  }

  public renderItem(itemProps: ServiceItemProps): ReactResult {
    return <Revision {...itemProps} />;
  }
}

export default new BugzillaService();
