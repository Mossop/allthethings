import { useCallback } from "react";

import type { PhabricatorAccount } from "#schema";
import type { ReactResult } from "#ui";
import { useSetSettingsPage, SettingsPageItem, useBoolState } from "#ui";

import Icon from "../Icon";
import { useListPhabricatorAccountsQuery } from "../operations";
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
    setSettingsPage(account.id, "phabricator");
  }, [closeAccountDialog, setSettingsPage]);

  let { data } = useListPhabricatorAccountsQuery();
  let accounts = data?.user?.phabricatorAccounts ?? [];

  return <>
    {
      accounts.map((account: PhabricatorAccount) => <SettingsPageItem
        key={account.id}
        pluginId="phabricator"
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
