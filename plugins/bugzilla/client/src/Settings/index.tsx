import type { ReactResult } from "@allthethings/ui";
import { useBoolState, SettingSection } from "@allthethings/ui";
import { useCallback } from "react";

import AccountDialog from "../AccountDialog";
import Icon from "../Icon";
import type { BugzillaAccount } from "../schema";
import { useListBugzillaAccountsQuery } from "../schema";
import AccountSettings from "./Account";

export function SettingsSections(): ReactResult {
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
      accounts.map((account: Omit<BugzillaAccount, "username">) => <SettingSection
        key={account.id}
        pluginId="@allthethings/bugzilla-server"
        sectionId={account.id}
        icon={account.icon ?? <Icon/>}
      >
        {account.name}
      </SettingSection>)
    }
    <SettingSection
      icon={<Icon/>}
      onClick={openAccountDialog}
    >
      Add Account
    </SettingSection>
    {
      showAccountDialog && <AccountDialog
        onClosed={closeAccountDialog}
        onAccountCreated={onAccountCreated}
      />
    }
  </>;
}

interface SettingsSectionProps {
  section: string;
}

export function SettingsSection({
  section,
}: SettingsSectionProps): ReactResult {
  let { data } = useListBugzillaAccountsQuery();
  let accounts = data?.user?.bugzillaAccounts ?? [];

  for (let account of accounts) {
    if (account.id == section) {
      return <AccountSettings account={account}/>;
    }
  }

  return <p>Unknown settings.</p>;
}
