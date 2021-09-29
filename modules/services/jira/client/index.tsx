import type {
  ClientService,
  ReactResult,
  ServiceItemProps,
} from "../../../client/utils";
import type { IssueFields } from "../schema";
import Issue from "./Issue";
import { SettingsPage, SettingsPages } from "./Settings";

class JiraService implements ClientService {
  public readonly serverId = "jira";
  public readonly name = "Jira";

  public renderServiceSettingsPage(page: string): ReactResult {
    return <SettingsPage page={page} />;
  }

  public renderServiceSettingsPageList(): ReactResult {
    return <SettingsPages />;
  }

  public renderItem(itemProps: ServiceItemProps): ReactResult {
    return <Issue issue={JSON.parse(itemProps.fields) as IssueFields} />;
  }
}

export default new JiraService();
