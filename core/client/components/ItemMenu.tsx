import {
  Collapse,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/MoreVert";
import { useCallback, useState } from "react";

import {
  Icons,
  useBoolState,
  useBoundCallback,
  useMenuState,
  bindTrigger,
  ReactMemo,
  Menu,
} from "#ui";
import type { ReactResult } from "#ui";

import type { Item } from "../schema";
import {
  useDeleteItemMutation,
  refetchQueriesForItem,
  isNoteItem,
  isFileItem,
  isLinkItem,
  isPluginItem,
} from "../schema";
import TaskDialog from "../ui/TaskDialog";
import { DueItemItems, DueItems } from "./DueMenu";
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
  Due,
}

interface ItemMenuProps {
  item: Item;
}

export default ReactMemo(function ItemMenu({
  item,
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
  let toggleDue = useBoundCallback(toggleMenu, OpenInnerMenu.Due);

  let [editDialogOpen, openEditDialog, closeEditDialog] = useBoolState();

  let [deleteItemMutation] = useDeleteItemMutation({
    variables: {
      id: item.id,
    },
    refetchQueries: refetchQueriesForItem(item),
  });

  let deleteItem = useCallback(() => deleteItemMutation(), [deleteItemMutation]);

  let isCurrentlyListed = isPluginItem(item) ? item.detail.isCurrentlyListed : false;

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
      <DueItemItems item={item}/>
      <MenuItem onClick={toggleDue}>
        <ListItemIcon><Icons.Due/></ListItemIcon>
        <ListItemText>Due...</ListItemText>
      </MenuItem>
      <Collapse in={openInnerMenu == OpenInnerMenu.Due}>
        <DueItems item={item} isInner={true}/>
      </Collapse>
      <WakeUpItems item={item}/>
      <MenuItem onClick={toggleSnooze}>
        <ListItemIcon><Icons.Snooze/></ListItemIcon>
        <ListItemText>Snooze...</ListItemText>
      </MenuItem>
      <Collapse in={openInnerMenu == OpenInnerMenu.Snooze}>
        <SnoozeItems item={item} isInner={true}/>
      </Collapse>
      {
        !isPluginItem(item) && <MenuItem onClick={openEditDialog}>
          <ListItemIcon><Icons.Edit/></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
      }
      {
        !isCurrentlyListed && <MenuItem onClick={deleteItem}>
          <ListItemIcon><Icons.Delete/></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      }
    </Menu>
    {editDialogOpen && renderEditDialog(item, closeEditDialog)}
  </>;
});
