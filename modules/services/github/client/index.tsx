import type {
  ClientService,
  ServiceItemProps,
  ReactResult,
} from "#client/utils";
import type { IssueLikeFields } from "#services/github/schema";

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
    let fields: IssueLikeFields = JSON.parse(itemProps.fields);
    return <IssueLike issueLike={fields} />;
  }
}

export default new GithubService();
