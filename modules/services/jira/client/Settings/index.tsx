import { useCallback } from "react";

import type { JiraAccountState, ReactResult } from "../../../../client/utils";
import {
  useBoolState,
  useSetSettingsPage,
  SettingsPageItem,
} from "../../../../client/utils";
import { useListJiraAccountsQuery } from "../api";
import Icon from "../Icon";
import AccountSettings from "./Account";
import AccountDialog from "./AccountDialog";

export function SettingsPages(): ReactResult {
  let [showAccountDialog, openAccountDialog, closeAccountDialog] =
    useBoolState(false);

  let setSettingsPage = useSetSettingsPage();

  let onAccountCreated = useCallback(
    (account: JiraAccountState) => {
      closeAccountDialog();
      setSettingsPage(account.id, "jira");
    },
    [closeAccountDialog, setSettingsPage],
  );

  let [data] = useListJiraAccountsQuery();
  let accounts = data ?? [];

  return (
    <>
      {accounts.map((account: JiraAccountState) => (
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
  let [data] = useListJiraAccountsQuery();
  let accounts = data ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account} />;
    }
  }

  return <p>Unknown settings.</p>;
}
