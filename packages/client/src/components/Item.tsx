import {
  useBoolState,
  Icons,
  Styles,
  ReactMemo,
  useMenuState,
  bindTrigger,
  Menu,
} from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import type { PureQueryOptions } from "@apollo/client";
import {
  IconButton,
  ListItem,
  createStyles,
  makeStyles,
  Tooltip,
  MenuItem,
  ListItemText,
} from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import clsx from "clsx";
import { DateTime } from "luxon";
import { useCallback, useRef } from "react";
import type { DropTargetMonitor } from "react-dnd";
import mergeRefs from "react-merge-refs";

import {
  useArchiveItemMutation,
  useDeleteItemMutation,
  useSnoozeItemMutation,
} from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import TaskDialog from "../ui/TaskDialog";
import { item as arrayItem } from "../utils/collections";
import type { DraggedItem, ItemDragResult } from "../utils/drag";
import { useDragResult, DragType, useDropArea, useItemDrag } from "../utils/drag";
import type { Item, Item as ItemState, Section, TaskList } from "../utils/state";
import { isFileItem, isLinkItem, isNoteItem, isPluginItem } from "../utils/state";
import FileItem from "./FileItem";
import LinkItem from "./LinkItem";
import NoteItem from "./NoteItem";
import PluginItem from "./PluginItem";
import TaskItem from "./TaskItem";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    item: {
      ...Styles.flexRow,
      "alignItems": "center",
      "fontSize": "1.1rem",
      "&:hover": {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
      },
    },
    dragPreview: {
      flex: 1,
      ...Styles.flexRow,
      alignItems: "center",
    },
    hidden: {
      display: "none",
    },
    dragging: {
      ...Styles.dragging,
    },
    dragHandleContainer: {
      ...Styles.flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    itemInner: {
      flex: 1,
      ...Styles.flexRow,
      alignItems: "center",
    },
    actions: {
      ...Styles.flexRow,
      alignItems: "center",
      justifyContent: "end",
    },
  }));

function renderItem({
  item,
  section,
  taskList,
  isDragging,
}: ItemRenderProps): ReactResult {
  if (isNoteItem(item))
    return <NoteItem item={item} section={section} taskList={taskList} isDragging={isDragging}/>;
  if (isFileItem(item))
    return <FileItem item={item} section={section} taskList={taskList} isDragging={isDragging}/>;
  if (isLinkItem(item))
    return <LinkItem item={item} section={section} taskList={taskList} isDragging={isDragging}/>;
  if (isPluginItem(item))
    return <PluginItem item={item} section={section} taskList={taskList} isDragging={isDragging}/>;
  return <TaskItem item={item} section={section} taskList={taskList} isDragging={isDragging}/>;
}

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

interface ItemProps {
  taskList: TaskList | null;
  section: Section | null;
  item: ItemState;
  items: ItemState[];
  index: number;
}

export type ItemRenderProps = Pick<ItemProps, "item" | "section" | "taskList"> & {
  isDragging: boolean;
};

export const ItemDragMarker = ReactMemo(function ItemDragMarker({
  item,
  section,
  taskList,
}: Pick<ItemProps, "item" | "section" | "taskList">): ReactResult {
  let classes = useStyles();

  let result = useDragResult(DragType.Item);

  let {
    dropRef,
  } = useDropArea(DragType.Item, {
    getDragResult: useCallback(
      () => result,
      [result],
    ),
  });

  return <ListItem
    className={clsx(classes.item, classes.dragging)}
    disableGutters={true}
    ref={dropRef}
  >
    <div className={classes.dragPreview}>
      <div className={classes.dragHandleContainer}>
        <Icons.Drag className={classes.dragHandle}/>
      </div>
      <div className={classes.itemInner}>
        {
          renderItem({
            item,
            section,
            taskList,
            isDragging: true,
          })
        }
      </div>
    </div>
  </ListItem>;
});

export default ReactMemo(function Item({
  item,
  section,
  taskList,
  items,
  index,
}: ItemProps): ReactResult {
  let classes = useStyles();

  let [editDialogOpen, openEditDialog, closeEditDialog] = useBoolState();

  let refetchQueries: PureQueryOptions[] = [
    refetchListContextStateQuery(),
  ];

  if (taskList) {
    refetchQueries.push(refetchListTaskListQuery({
      taskList: taskList.id,
    }));
  }

  let [deleteItemMutation] = useDeleteItemMutation({
    variables: {
      id: item.id,
    },
    refetchQueries,
  });

  let deleteItem = useCallback(() => deleteItemMutation(), [deleteItemMutation]);

  let [archiveItemMutation] = useArchiveItemMutation({
    refetchQueries,
  });

  let archiveItem = useCallback(() => {
    if (item.archived) {
      return archiveItemMutation({
        variables: {
          id: item.id,
          archived: null,
        },
      });
    } else {
      return archiveItemMutation({
        variables: {
          id: item.id,
          archived: DateTime.now(),
        },
      });
    }
  }, [item, archiveItemMutation]);

  let [snoozeItemMutation] = useSnoozeItemMutation({
    refetchQueries,
  });

  let wakeUp = useCallback(() => {
    return snoozeItemMutation({
      variables: {
        id: item.id,
        snoozed: null,
      },
    });
  }, [item.id, snoozeItemMutation]);

  let snoozeTomorrow = useCallback(() => {
    let tomorrow = DateTime.now().plus({ days: 1 }).set({ hour: 8 }).startOf("hour");
    return snoozeItemMutation({
      variables: {
        id: item.id,
        snoozed: tomorrow,
      },
    });
  }, [item.id, snoozeItemMutation]);

  let snoozeNextWeek = useCallback(() => {
    let tomorrow = DateTime.now().plus({ weeks: 1 }).startOf("week").set({ hour: 8 });
    return snoozeItemMutation({
      variables: {
        id: item.id,
        snoozed: tomorrow,
      },
    });
  }, [item.id, snoozeItemMutation]);

  let snoozeMenuState = useMenuState("filter");

  let {
    dragRef,
    previewRef,
    isDragging,
  } = useItemDrag(item);

  let elementRef = useRef<Element>(null);

  let {
    dropRef,
  } = useDropArea(DragType.Item, {
    getDragResult: useCallback(
      (_: DraggedItem, monitor: DropTargetMonitor): ItemDragResult | null => {
        if (!taskList || !elementRef.current) {
          return null;
        }

        let offset = monitor.getClientOffset();
        if (!offset) {
          return null;
        }

        let { top, bottom } = elementRef.current.getBoundingClientRect();
        let mid = (top + bottom) / 2;
        let { y } = offset;
        if (y < mid) {
          return {
            type: DragType.Item,
            target: section ?? taskList,
            before: item,
          };
        }

        return {
          type: DragType.Item,
          target: section ?? taskList,
          before: arrayItem(items, index + 1),
        };
      },
      [index, item, items, section, taskList],
    ),
  });

  let itemRef = mergeRefs([dropRef, elementRef]);

  return <>
    <ListItem
      className={clsx(classes.item, isDragging && classes.hidden)}
      disableGutters={true}
      ref={itemRef}
    >
      <div className={classes.dragPreview} ref={previewRef}>
        <div className={classes.dragHandleContainer} ref={dragRef}>
          <Icons.Drag className={classes.dragHandle}/>
        </div>
        <div className={classes.itemInner}>
          {
            renderItem({
              item,
              section,
              taskList,
              isDragging: false,
            })
          }
        </div>
      </div>
      <div className={classes.actions}>
        <Tooltip title="Snooze">
          <IconButton {...bindTrigger(snoozeMenuState)}>
            <Icons.Snooze/>
          </IconButton>
        </Tooltip>
        <Menu
          state={snoozeMenuState}
          anchor={
            {
              vertical: "bottom",
              horizontal: "right",
            }
          }
        >
          {
            item.snoozed && <MenuItem onClick={wakeUp}>
              <ListItemText>Wake up</ListItemText>
            </MenuItem>
          }
          <MenuItem onClick={snoozeTomorrow}>
            <ListItemText>Tomorrow</ListItemText>
          </MenuItem>
          <MenuItem onClick={snoozeNextWeek}>
            <ListItemText>Next Week</ListItemText>
          </MenuItem>
        </Menu>
        {
          item.archived
            ? <Tooltip title="Unarchive">
              <IconButton onClick={archiveItem}>
                <Icons.Unarchive/>
              </IconButton>
            </Tooltip>
            : <Tooltip title="Archive">
              <IconButton onClick={archiveItem}>
                <Icons.Archive/>
              </IconButton>
            </Tooltip>
        }
        {
          !isPluginItem(item) && <>
            <Tooltip title="Edit">
              <IconButton onClick={openEditDialog}>
                <Icons.Edit/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={deleteItem}>
                <Icons.Delete/>
              </IconButton>
            </Tooltip>
          </>
        }
      </div>
    </ListItem>
    {editDialogOpen && renderEditDialog(item, closeEditDialog)}
  </>;
});
