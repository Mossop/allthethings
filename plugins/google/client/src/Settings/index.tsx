import type { ReactResult } from "@allthethings/ui";
import { SettingsPageItem } from "@allthethings/ui";

import Google from "../logos/Google";

export function SettingsPages(): ReactResult {
  return <SettingsPageItem
    icon={<Google/>}
  >
      Add Account
  </SettingsPageItem>;
}
