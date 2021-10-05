import type { GithubAccountState, ReactResult } from "../../../../client/utils";
import { SettingsPageItem } from "../../../../client/utils";
import { useListGithubAccountsQuery, useLoginUrlQuery } from "../api";
import GitHub from "../logos/GitHub";
import AccountSettings from "./Account";

export function SettingsPages(): ReactResult {
  let [loginUrl] = useLoginUrlQuery();
  let [data] = useListGithubAccountsQuery();
  let accounts = data ?? [];

  return (
    <>
      {accounts.map((account: GithubAccountState) => (
        <SettingsPageItem
          key={account.id}
          serviceId="github"
          page={account.id}
          icon={account.avatar}
        >
          {account.user}
        </SettingsPageItem>
      ))}
      {loginUrl && (
        <SettingsPageItem icon={<GitHub />} href={loginUrl}>
          Add Account
        </SettingsPageItem>
      )}
    </>
  );
}

interface SettingsPageProps {
  page: string;
}

export function SettingsPage({ page }: SettingsPageProps): ReactResult {
  let [data] = useListGithubAccountsQuery();
  let accounts = data ?? [];

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account} />;
    }
  }

  return <p>Unknown settings.</p>;
}
