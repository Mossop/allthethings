import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import md5 from "md5";
import { useCallback } from "react";

import { useLogoutMutation } from "../schema/mutations";
import { refetchCurrentUserQuery, useCurrentUserQuery } from "../schema/queries";
import type { ReactResult } from "../utils/types";

function avatarSources(email: string): string[] {
  let hash = md5(email);
  return [
    `https://www.gravatar.com/avatar/${hash}?s=40`,
    `https://www.gravatar.com/avatar/${hash}?s=60 1.5x`,
    `https://www.gravatar.com/avatar/${hash}?s=80 2x`,
  ];
}

export default function UserMenu(): ReactResult {
  let { data: { user } = { user: null } } = useCurrentUserQuery();
  let [logout] = useLogoutMutation({
    refetchQueries: [refetchCurrentUserQuery()],
  });
  let userMenuState = usePopupState({ variant: "popover", popupId: "user-menu" });

  let doLogout = useCallback(async (): Promise<void> => {
    userMenuState.close();
    void logout();
  }, [logout]);

  if (!user) {
    return null;
  }

  return <>
    <IconButton id="banner-user-menu" {...bindTrigger(userMenuState)}>
      <Avatar
        srcSet={avatarSources(user.email).join(", ")}
        src={avatarSources(user.email)[0]}
      />
    </IconButton>
    <Menu
      {...bindMenu(userMenuState)}
      anchorOrigin={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
      transformOrigin={
        {
          vertical: "top",
          horizontal: "right",
        }
      }
      keepMounted={true}
      getContentAnchorEl={null}
    >
      <MenuItem id="user-menu-logout" onClick={doLogout}>Logout</MenuItem>
    </Menu>
  </>;
}
