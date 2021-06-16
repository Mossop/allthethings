import type { ReactResult } from "@allthethings/ui";
import {
  useBoundCallback,
  useMenuState,
  bindTrigger,
  ReactMemo,
  Menu,
} from "@allthethings/ui";
import {
  Collapse,
  IconButton,
  ListItemText,
  MenuItem,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/MoreVert";
import type { DateTime } from "luxon";
import { useCallback, useState } from "react";

import type { Item } from "../utils/state";
import { SnoozeItems, WakeUpItems } from "./SnoozeMenu";

enum OpenInnerMenu {
  None,
  Snooze,
}

interface ItemMenuProps {
  item: Item;
  onSnooze: (till: DateTime | null) => void;
  onDelete?: (() => void) | null;
}

export default ReactMemo(function ItemMenu({
  item,
  onSnooze,
  onDelete,
}: ItemMenuProps): ReactResult {
  let itemMenuState = useMenuState("item");

  let [openInnerMenu, setOpenInnerMenu] = useState(OpenInnerMenu.None);
  let toggleMenu = useCallback((menu: OpenInnerMenu, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenInnerMenu((current: OpenInnerMenu): OpenInnerMenu => {
      return current == menu ? OpenInnerMenu.None : menu;
    });
  }, []);
  let closeMenus = useCallback(() => setOpenInnerMenu(OpenInnerMenu.None), []);
  let toggleSnooze = useBoundCallback(toggleMenu, OpenInnerMenu.Snooze);

  return <>
    <IconButton
      {...bindTrigger(itemMenuState)}
    >
      <MenuIcon/>
    </IconButton>
    <Menu
      onClosed={closeMenus}
      state={itemMenuState}
      anchor={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
    >
      <WakeUpItems item={item} onSnooze={onSnooze}/>
      <MenuItem onClick={toggleSnooze}>
        <ListItemText>Snooze...</ListItemText>
      </MenuItem>
      <Collapse in={openInnerMenu == OpenInnerMenu.Snooze}>
        <SnoozeItems item={item} isInner={true} onSnooze={onSnooze}/>
      </Collapse>
      {
        onDelete && <MenuItem onClick={onDelete}>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      }
    </Menu>
  </>;
});
