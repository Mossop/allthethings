import type { ReactResult } from "@allthethings/ui";
import { SettingsPageItem } from "@allthethings/ui";

import Google from "../logos/Google";
import type { GoogleAccount } from "../schema";
import { useListGoogleAccountsQuery, useRequestLoginUrlQuery } from "../schema";
import AccountSettings from "./Account";

export function SettingsPages(): ReactResult {
  let { data: loginUrlData } = useRequestLoginUrlQuery();
  let loginUrl = loginUrlData?.googleLoginUrl;
  let { data } = useListGoogleAccountsQuery();
  let accounts = data?.user?.googleAccounts ?? [];

  return <>
    {
      accounts.map((account: GoogleAccount) => <SettingsPageItem
        key={account.id}
        pluginId="@allthethings/google-server"
        page={account.id}
        icon={account.avatar ?? <Google/>}
      >
        {account.email}
      </SettingsPageItem>)
    }
    {
      loginUrlData && <SettingsPageItem
        icon={<Google/>}
        href={loginUrl}
      >
        Add Account
      </SettingsPageItem>
    }
  </>;
}

interface SettingsPageProps {
  page: string;
}

export function SettingsPage({
  page,
}: SettingsPageProps): ReactResult {
  let { data } = useListGoogleAccountsQuery();
  let accounts = data?.user?.googleAccounts ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account}/>;
    }
  }

  return <p>Unknown settings.</p>;
}
