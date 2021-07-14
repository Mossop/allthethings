import type { ReactResult } from "#client-utils";
import { SettingsPageItem } from "#client-utils";
import type { GithubAccount } from "#schema";

import GitHub from "../logos/GitHub";
import { useListGithubAccountsQuery, useRequestLoginUrlQuery } from "../operations";
import AccountSettings from "./Account";

export function SettingsPages(): ReactResult {
  let { data: loginUrlData } = useRequestLoginUrlQuery();
  let loginUrl = loginUrlData?.githubLoginUrl;
  let { data } = useListGithubAccountsQuery();
  let accounts = data?.user?.githubAccounts ?? [];

  return <>
    {
      accounts.map((account: GithubAccount) => <SettingsPageItem
        key={account.id}
        pluginId="google"
        page={account.id}
        icon={account.avatar}
      >
        {account.user}
      </SettingsPageItem>)
    }
    {
      loginUrlData && <SettingsPageItem
        icon={<GitHub/>}
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
  let { data } = useListGithubAccountsQuery();
  let accounts = data?.user?.githubAccounts ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account}/>;
    }
  }

  return <p>Unknown settings.</p>;
}
