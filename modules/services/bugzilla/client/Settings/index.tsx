import { useCallback } from "react";

import type {
  BugzillaAccountState,
  ReactResult,
} from "../../../../client/utils";
import {
  useSetSettingsPage,
  SettingsPageItem,
  useBoolState,
} from "../../../../client/utils";
import { useListBugzillaAccountsQuery } from "../api";
import Icon from "../Icon";
import AccountSettings from "./Account";
import AccountDialog from "./AccountDialog";

export function SettingsPages(): ReactResult {
  let [showAccountDialog, openAccountDialog, closeAccountDialog] =
    useBoolState(false);

  let setSettingsPage = useSetSettingsPage();

  let onAccountCreated = useCallback(
    (account: BugzillaAccountState) => {
      closeAccountDialog();
      setSettingsPage(account.id, "bugzilla");
    },
    [closeAccountDialog, setSettingsPage],
  );

  let [data] = useListBugzillaAccountsQuery();
  let accounts = data ?? [];

  return (
    <>
      {accounts.map((account: BugzillaAccountState) => (
        <SettingsPageItem
          key={account.id}
          serviceId="bugzilla"
          page={account.id}
          icon={account.icon ?? <Icon />}
        >
          {account.name}
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
  let [data] = useListBugzillaAccountsQuery();
  let accounts = data ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account} />;
    }
  }

  return <p>Unknown settings.</p>;
}
