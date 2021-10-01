import type { GoogleAccountState, ReactResult } from "../../../../client/utils";
import { SettingsPageItem } from "../../../../client/utils";
import { useListGoogleAccountsQuery, useLoginUrlQuery } from "../api";
import Google from "../logos/Google";
import AccountSettings from "./Account";

export function SettingsPages(): ReactResult {
  let [loginUrl] = useLoginUrlQuery();

  let [accounts = []] = useListGoogleAccountsQuery();

  return (
    <>
      {accounts.map((account: GoogleAccountState) => (
        <SettingsPageItem
          key={account.id}
          serviceId="google"
          page={account.id}
          icon={account.avatar ?? <Google />}
        >
          {account.email}
        </SettingsPageItem>
      ))}
      {loginUrl && (
        <SettingsPageItem icon={<Google />} href={loginUrl}>
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
  let [accounts = []] = useListGoogleAccountsQuery();

  for (let account of accounts) {
    if (account.id == page) {
      return <AccountSettings account={account} />;
    }
  }

  return <p>Unknown settings.</p>;
}
