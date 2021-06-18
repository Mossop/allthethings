import type { ReactResult } from "@allthethings/ui";
import {
  useBoolState,
  pushUrl,
  useResetStore,
  ReactMemo,
  Menu,
  useMenuState,
  bindTrigger,
} from "@allthethings/ui";
import { Avatar, IconButton, MenuItem, createStyles, makeStyles } from "@material-ui/core";
import md5 from "md5";
import { useCallback } from "react";

import type { User } from "../schema";
import { useLogoutMutation, refetchListContextStateQuery } from "../schema";
import { pushView, useView, ViewType } from "../utils/view";
import ChangePasswordDialog from "./ChangePasswordDialog";

function avatarSources(email: string): string[] {
  let hash = md5(email);
  return [
    `https://www.gravatar.com/avatar/${hash}?s=40`,
    `https://www.gravatar.com/avatar/${hash}?s=60 1.5x`,
    `https://www.gravatar.com/avatar/${hash}?s=80 2x`,
  ];
}

const useStyles = makeStyles(() =>
  createStyles({
    avatar: {
      width: 32,
      height: 32,
    },
  }));

interface UserMenuProps {
  user: User;
}

export default ReactMemo(function UserMenu({
  user,
}: UserMenuProps): ReactResult {
  let view = useView();
  let classes = useStyles();
  let [logout] = useLogoutMutation({
    refetchQueries: [refetchListContextStateQuery()],
  });
  let userMenuState = useMenuState("user-menu");
  let resetStore = useResetStore();
  let [changePasswordOpen, showChangePassword, closeChangePassword] = useBoolState();

  let doLogout = useCallback(async (): Promise<void> => {
    pushUrl(new URL("/", document.documentURI));
    await logout();
    await resetStore();
  }, [logout, resetStore]);

  let doSettings = useCallback((): void => {
    pushView({
      type: ViewType.Settings,
      page: "general",
    }, view);
  }, [view]);

  return <>
    <IconButton id="banner-user-menu" {...bindTrigger(userMenuState)}>
      <Avatar
        srcSet={avatarSources(user.email).join(", ")}
        src={avatarSources(user.email)[0]}
        className={classes.avatar}
      />
    </IconButton>
    <Menu
      state={userMenuState}
      anchor={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
    >
      <MenuItem id="user-menu-settings" onClick={doSettings}>Settings</MenuItem>
      <MenuItem id="user-menu-password" onClick={showChangePassword}>Change Password...</MenuItem>
      <MenuItem id="user-menu-logout" onClick={doLogout}>Logout</MenuItem>
    </Menu>
    {changePasswordOpen && <ChangePasswordDialog onClosed={closeChangePassword}/>}
  </>;
});
