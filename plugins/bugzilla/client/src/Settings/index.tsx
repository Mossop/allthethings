import type { ReactResult } from "@allthethings/ui";
import { SettingsPageItem, useBoolState } from "@allthethings/ui";
import { useCallback } from "react";

import AccountDialog from "../AccountDialog";
import Icon from "../Icon";
import type { BugzillaAccount } from "../schema";
import { useListBugzillaAccountsQuery } from "../schema";
import AccountSettings from "./Account";

export function SettingsPages(): ReactResult {
  let [
    showAccountDialog,
    openAccountDialog,
    closeAccountDialog,
  ] = useBoolState(false);

  let onAccountCreated = useCallback(() => {
    closeAccountDialog();
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
