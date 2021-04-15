import type { ReactResult } from "@allthethings/ui";
import { useSetSettingsPage, SettingsPageItem, useBoolState } from "@allthethings/ui";
import { useCallback } from "react";

import Icon from "../Icon";
import type { BugzillaAccount } from "../schema";
import { useListBugzillaAccountsQuery } from "../schema";
import AccountSettings from "./Account";
import AccountDialog from "./AccountDialog";

export function SettingsPages(): ReactResult {
  let [
    showAccountDialog,
    openAccountDialog,
    closeAccountDialog,
  ] = useBoolState(false);

  let setSettingsPage = useSetSettingsPage();

  let onAccountCreated = useCallback((account: Omit<BugzillaAccount, "username">) => {
    closeAccountDialog();
    setSettingsPage(account.id, "@allthethings/bugzilla-server");
  }, []);

  let { data } = useListBugzillaAccountsQuery();
  let accounts = data?.user?.bugzillaAccounts ?? [];

  return <>
    {
      accounts.map((account: Omit<BugzillaAccount, "username">) => <SettingsPageItem
        key={account.id}
        pluginId="@allthethings/bugzilla-server"
        page={account.id}
        icon={account.icon ?? <Icon/>}
      >
        {account.name}
      </SettingsPageItem>)
    }
    <SettingsPageItem
      icon={<Icon/>}
      onClick={openAccountDialog}
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
  let { data } = useListBugzillaAccountsQuery();
  let accounts = data?.user?.bugzillaAccounts ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account}/>;
    }
  }

  return <p>Unknown settings.</p>;
}
