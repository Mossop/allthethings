import { useCallback } from "react";

import type {
  PhabricatorAccountState,
  ReactResult,
} from "../../../../client/utils";
import {
  useSetSettingsPage,
  SettingsPageItem,
  useBoolState,
} from "../../../../client/utils";
import { useListPhabricatorAccountsQuery } from "../api";
import Icon from "../Icon";
import AccountSettings from "./Account";
import AccountDialog from "./AccountDialog";

export function SettingsPages(): ReactResult {
  let [showAccountDialog, openAccountDialog, closeAccountDialog] =
    useBoolState(false);

  let setSettingsPage = useSetSettingsPage();

  let onAccountCreated = useCallback(
    (account: PhabricatorAccountState) => {
      closeAccountDialog();
      setSettingsPage(account.id, "phabricator");
    },
    [closeAccountDialog, setSettingsPage],
  );

  let [data] = useListPhabricatorAccountsQuery();
  let accounts = data ?? [];

  return (
    <>
      {accounts.map((account: PhabricatorAccountState) => (
        <SettingsPageItem
          key={account.id}
          serviceId="phabricator"
          page={account.id}
          icon={account.icon}
        >
          {account.url}
        </SettingsPageItem>
      ))}
      <SettingsPageItem icon={<Icon />} onClick={openAccountDialog}>
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
  let [data] = useListPhabricatorAccountsQuery();
  let accounts = data ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account} />;
    }
  }

  return <p>Unknown settings.</p>;
}
