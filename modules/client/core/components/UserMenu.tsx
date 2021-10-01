import {
  Avatar,
  IconButton,
  MenuItem,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import md5 from "md5";
import { useCallback } from "react";

import {
  useBoolState,
  ReactMemo,
  Menu,
  useMenuState,
  bindTrigger,
  useResetStore,
} from "../../utils";
import type { ReactResult } from "../../utils";
import ChangePasswordDialog from "../dialogs/ChangePassword";
import { useLogout } from "../utils/api";
import { useUser } from "../utils/globalState";
import { pushView, ViewType } from "../utils/view";

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
  }),
);

export default ReactMemo(function UserMenu(): ReactResult {
  let user = useUser();
  let classes = useStyles();
  let userMenuState = useMenuState("user-menu");
  let [changePasswordOpen, showChangePassword, closeChangePassword] =
    useBoolState();
  let resetStore = useResetStore();
  let [logout] = useLogout();

  let doLogout = useCallback(async (): Promise<void> => {
    await logout();

    let url = new URL("/api/logout", document.URL);
    await fetch(url.toString(), {
      method: "POST",
    });
    await resetStore();
  }, [resetStore, logout]);

  let doSettings = useCallback((): void => {
    pushView({
      type: ViewType.Settings,
      page: "general",
    });
  }, []);

  return (
    <>
      <IconButton id="banner-user-menu" {...bindTrigger(userMenuState)}>
        <Avatar
          srcSet={avatarSources(user.email).join(", ")}
          src={avatarSources(user.email)[0]}
          className={classes.avatar}
        />
      </IconButton>
      <Menu
        state={userMenuState}
        anchor={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <MenuItem id="user-menu-settings" onClick={doSettings}>
          Settings
        </MenuItem>
        <MenuItem id="user-menu-password" onClick={showChangePassword}>
          Change Password...
        </MenuItem>
        <MenuItem id="user-menu-logout" onClick={doLogout}>
          Logout
        </MenuItem>
      </Menu>
      {changePasswordOpen && (
        <ChangePasswordDialog onClosed={closeChangePassword} />
      )}
    </>
  );
});
