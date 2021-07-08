import { useCallback } from "react";

import type { ReactResult } from "#ui";
import { useBoolState, useSetSettingsPage, SettingsPageItem } from "#ui";

import Icon from "../Icon";
import type { JiraAccount } from "../schema";
import { useListJiraAccountsQuery } from "../schema";
import AccountSettings from "./Account";
import AccountDialog from "./AccountDialog";

export function SettingsPages(): ReactResult {
  let [
    showAccountDialog,
    openAccountDialog,
    closeAccountDialog,
  ] = useBoolState(false);

  let setSettingsPage = useSetSettingsPage();

  let onAccountCreated = useCallback((account: Omit<JiraAccount, "username">) => {
    closeAccountDialog();
    setSettingsPage(account.id, "@allthethings/bugzilla-server");
  }, [closeAccountDialog, setSettingsPage]);

  let { data } = useListJiraAccountsQuery();
  let accounts = data?.user?.jiraAccounts ?? [];

  return <>
    {
      accounts.map((account:JiraAccount) => <SettingsPageItem
        key={account.id}
        pluginId="@allthethings/jira-server"
        page={account.id}
        icon={<Icon/>}
      >
        {account.url}
      </SettingsPageItem>)
    }
    <SettingsPageItem
      onClick={openAccountDialog}
      icon={<Icon/>}
    >
      Add Account
    </SettingsPageItem>
    {
      showAccountDialog && <AccountDialog
        onClosed={closeAccountDialog}
        onAccountCreated={onAccountCreated}
      />
    }
  </>;
}

interface SettingsPageProps {
  page: string;
}

export function SettingsPage({
  page,
}: SettingsPageProps): ReactResult {
  let { data } = useListJiraAccountsQuery();
  let accounts = data?.user?.jiraAccounts ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account}/>;
    }
  }

  return <p>Unknown settings.</p>;
}
