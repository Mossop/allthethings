import type { ReactResult } from "@allthethings/ui";
import {
  Icons,
  useBoolState,
  useBoundCallback,
  useMenuState,
  bindTrigger,
  ReactMemo,
  Menu,
} from "@allthethings/ui";
import {
  Collapse,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/MoreVert";
import type { DateTime } from "luxon";
import { useCallback, useState } from "react";

import TaskDialog from "../ui/TaskDialog";
import type { Item } from "../utils/state";
import { isFileItem, isLinkItem, isNoteItem, isPluginItem } from "../utils/state";
import { SnoozeItems, WakeUpItems } from "./SnoozeMenu";

function renderEditDialog(item: Item, onClosed: () => void): ReactResult {
  if (isNoteItem(item))
    return <div/>;
  if (isFileItem(item))
    return <div/>;
  if (isLinkItem(item))
    return <div/>;
  if (isPluginItem(item))
    throw new Error("Cannot edit plugin items.");
  return <TaskDialog task={item} onClosed={onClosed}/>;
}

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

  let [editDialogOpen, openEditDialog, closeEditDialog] = useBoolState();

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
        <ListItemIcon><Icons.Snooze/></ListItemIcon>
        <ListItemText>Snooze...</ListItemText>
      </MenuItem>
      <Collapse in={openInnerMenu == OpenInnerMenu.Snooze}>
        <SnoozeItems item={item} isInner={true} onSnooze={onSnooze}/>
      </Collapse>
      {
        !isPluginItem(item) && <MenuItem onClick={openEditDialog}>
          <ListItemIcon><Icons.Edit/></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
      }
      {
        onDelete && <MenuItem onClick={onDelete}>
          <ListItemIcon><Icons.Delete/></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      }
    </Menu>
    {editDialogOpen && renderEditDialog(item, closeEditDialog)}
  </>;
});
