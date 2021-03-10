import { useBoolState, SettingSection, PluginManager } from "@allthethings/ui";
import type { ClientPlugin } from "@allthethings/ui";
import type { ReactNode, ReactElement } from "react";
import { useCallback } from "react";

import AccountDialog from "./AccountDialog";
import Icon from "./Icon";
import { useListBugzillaAccountsQuery } from "./schema";

interface BugzillaAccount {
  id: string;
  icon: string | null;
  url: string;
}
function SettingSections(): ReactElement {
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

class BugzillaPlugin implements ClientPlugin {
  public readonly id = "bugzilla";
  public readonly name = "Bugzilla";

  public renderPluginSections(): ReactNode {
    return <SettingSections/>;
  }
}

void PluginManager.registerPlugin(new BugzillaPlugin());
