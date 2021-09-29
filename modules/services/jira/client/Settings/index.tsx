import { useCallback } from "react";

import type { ReactResult } from "../../../../client/utils";
import {
  useBoolState,
  useSetSettingsPage,
  SettingsPageItem,
} from "../../../../client/utils";
import type { JiraAccount } from "../../../../schema";
import Icon from "../Icon";
import { useListJiraAccountsQuery } from "../operations";
import AccountSettings from "./Account";
import AccountDialog from "./AccountDialog";

export function SettingsPages(): ReactResult {
  let [showAccountDialog, openAccountDialog, closeAccountDialog] =
    useBoolState(false);

  let setSettingsPage = useSetSettingsPage();

  let onAccountCreated = useCallback(
    (account: Omit<JiraAccount, "username">) => {
      closeAccountDialog();
      setSettingsPage(account.id, "jira");
    },
    [closeAccountDialog, setSettingsPage],
  );

  let { data } = useListJiraAccountsQuery();
  let accounts = data?.user?.jiraAccounts ?? [];

  return (
    <>
      {accounts.map((account: JiraAccount) => (
        <SettingsPageItem
          key={account.id}
          serviceId="jira"
          page={account.id}
          icon={<Icon />}
        >
          {account.url}
        </SettingsPageItem>
      ))}
      <SettingsPageItem onClick={openAccountDialog} icon={<Icon />}>
        Add Account
      </SettingsPageItem>
      {showAccountDialog && (
        <AccountDialog
          onClosed={closeAccountDialog}
          onAccountCreated={onAccountCreated}
        />
      )}
    </>
  );
}

interface SettingsPageProps {
  page: string;
}

export function SettingsPage({ page }: SettingsPageProps): ReactResult {
  let { data } = useListJiraAccountsQuery();
  let accounts = data?.user?.jiraAccounts ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account} />;
    }
  }

  return <p>Unknown settings.</p>;
}
