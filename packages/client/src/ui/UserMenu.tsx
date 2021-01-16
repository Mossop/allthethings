import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import md5 from "md5";
import { useCallback } from "react";

import { useLogoutMutation } from "../schema/mutations";
import type { CurrentUserQuery } from "../schema/operations";
import { refetchCurrentUserQuery } from "../schema/queries";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

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
  user: NonNullable<CurrentUserQuery["user"]>;
}

export default ReactMemo(function UserMenu({
  user,
}: UserMenuProps): ReactResult {
  let classes = useStyles();
  let [logout] = useLogoutMutation({
    refetchQueries: [refetchCurrentUserQuery()],
  });
  let userMenuState = usePopupState({ variant: "popover", popupId: "user-menu" });

  let doLogout = useCallback(async (): Promise<void> => {
    userMenuState.close();
    void logout();
  }, [logout, userMenuState]);

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
      <MenuItem id="user-menu-logout" onClick={doLogout}>Logout</MenuItem>
    </Menu>
  </>;
});
