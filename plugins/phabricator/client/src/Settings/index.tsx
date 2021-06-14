import type { ReactResult } from "@allthethings/ui";
import { useSetSettingsPage, SettingsPageItem, useBoolState } from "@allthethings/ui";
import { useCallback } from "react";

import Icon from "../Icon";
import type { PhabricatorAccount } from "../schema";
import { useListPhabricatorAccountsQuery } from "../schema";
import AccountSettings from "./Account";
import AccountDialog from "./AccountDialog";

export function SettingsPages(): ReactResult {
  let [
    showAccountDialog,
    openAccountDialog,
    closeAccountDialog,
  ] = useBoolState(false);

  let setSettingsPage = useSetSettingsPage();

  let onAccountCreated = useCallback((account: Omit<PhabricatorAccount, "username">) => {
    closeAccountDialog();
    setSettingsPage(account.id, "@allthethings/phabricator-server");
  }, [closeAccountDialog, setSettingsPage]);

  let { data } = useListPhabricatorAccountsQuery();
  let accounts = data?.user?.phabricatorAccounts ?? [];

  return <>
    {
      accounts.map((account: PhabricatorAccount) => <SettingsPageItem
        key={account.id}
        pluginId="@allthethings/phabricator-server"
        page={account.id}
        icon={account.icon}
      >
        {account.url}
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
  let { data } = useListPhabricatorAccountsQuery();
  let accounts = data?.user?.phabricatorAccounts ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account}/>;
    }
  }

  return <p>Unknown settings.</p>;
}
