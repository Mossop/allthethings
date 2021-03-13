import type { ReactResult } from "@allthethings/ui";
import { useBoolState, SettingSection } from "@allthethings/ui";
import { useCallback } from "react";

import AccountDialog from "./AccountDialog";
import Icon from "./Icon";
import { useListBugzillaAccountsQuery } from "./schema";

interface BugzillaAccount {
  id: string;
  icon: string | null;
  url: string;
}

export function SettingSections(): ReactResult {
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
      accounts.map((account: BugzillaAccount) => <SettingSection
        key={`bugzilla:${account.url}`}
        sectionId={`bugzilla:${account.url}`}
        icon={<Icon/>}
      >
        {account.url}
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
