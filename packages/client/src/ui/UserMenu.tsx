import { Avatar, IconButton, Menu, MenuItem, createStyles, makeStyles } from "@material-ui/core";
import md5 from "md5";
import { useCallback } from "react";

import { bindMenu, bindTrigger, usePopupState } from "../popup-state/hooks";
import { useLogoutMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";
import type { User } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { pushView, useView, ViewType } from "../utils/view";

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
  let userMenuState = usePopupState({ variant: "popover", popupId: "user-menu" });

  let doLogout = useCallback(async (): Promise<void> => {
    userMenuState.close();
    void logout();
  }, [logout, userMenuState]);

  let doSettings = useCallback((): void => {
    userMenuState.close();
    pushView({
      type: ViewType.Settings,
    }, view);
  }, [view, userMenuState]);

  return <>
    <IconButton id="banner-user-menu" {...bindTrigger(userMenuState)}>
      <Avatar
        srcSet={avatarSources(user.email).join(", ")}
        src={avatarSources(user.email)[0]}
        className={classes.avatar}
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
      <MenuItem id="user-menu-settings" onClick={doSettings}>Settings</MenuItem>
      <MenuItem id="user-menu-logout" onClick={doLogout}>Logout</MenuItem>
    </Menu>
  </>;
});
