import type {
  ClientService,
  ServiceItemProps,
  ReactResult,
} from "../../../client/utils";
import type { IssueLikeFields } from "../schema";
import IssueLike from "./IssueLike";
import { SettingsPage, SettingsPages } from "./Settings";

class GithubService implements ClientService {
  public readonly serverId = "github";
  public readonly name = "GitHub";

  public renderServiceSettingsPageList(): ReactResult {
    return <SettingsPages />;
  }

  public renderServiceSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page} />;
  }

  public renderItem(itemProps: ServiceItemProps): ReactResult {
    let fields: IssueLikeFields = itemProps.fields as IssueLikeFields;
    return <IssueLike issueLike={fields} />;
  }
}

export default new GithubService();
