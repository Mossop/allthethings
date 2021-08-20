import type { PopoverOrigin } from "@material-ui/core";
import { Menu as MuiMenu } from "@material-ui/core";
import type { PopupState } from "material-ui-popup-state/hooks";
import { bindMenu, usePopupState } from "material-ui-popup-state/hooks";
import { useCallback } from "react";

import type { ReactChildren } from "./types";
import { ReactMemo } from "./types";

export { bindTrigger, PopupState } from "material-ui-popup-state/hooks";

export function useMenuState(popupId: string): PopupState {
  return usePopupState({ variant: "popover", popupId });
}

export interface MenuProps {
  state: PopupState;
  anchor?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "right";
  };
  onClosed?: () => void;
  keepMounted?: boolean;
}

export const Menu = ReactMemo(function Menu({
  state,
  anchor = { vertical: "bottom", horizontal: "left" },
  onClosed,
  keepMounted = false,
  children,
}: MenuProps & ReactChildren) {
  let anchorOrigin: PopoverOrigin = {
    ...anchor,
  };

  let transformOrigin: PopoverOrigin = {
    ...anchor,
    vertical: anchor.vertical == "top" ? "bottom" : "top",
  };

  let closeMenu = useCallback(() => state.close(), [state]);

  return (
    <MuiMenu
      {...bindMenu(state)}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      keepMounted={keepMounted}
      getContentAnchorEl={null}
      onClick={closeMenu}
      onExited={onClosed}
    >
      {children}
    </MuiMenu>
  );
});
