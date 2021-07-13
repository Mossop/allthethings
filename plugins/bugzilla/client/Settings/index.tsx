import { useCallback } from "react";

import type { ReactResult } from "#client-utils";
import { useSetSettingsPage, SettingsPageItem, useBoolState } from "#client-utils";
import type { BugzillaAccount } from "#schema";

import Icon from "../Icon";
import { useListBugzillaAccountsQuery } from "../operations";
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
    setSettingsPage(account.id, "bugzilla");
  }, [closeAccountDialog, setSettingsPage]);

  let { data } = useListBugzillaAccountsQuery();
  let accounts = data?.user?.bugzillaAccounts ?? [];

  return <>
    {
      accounts.map((account: Omit<BugzillaAccount, "username">) => <SettingsPageItem
        key={account.id}
        pluginId="bugzilla"
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
