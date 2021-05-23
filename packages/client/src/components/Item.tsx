import { TaskController } from "@allthethings/schema";
import {
  useBoolState,
  Icons,
  Styles,
  ReactMemo,
  useMenuState,
  bindTrigger,
  Menu,
} from "@allthethings/ui";
import type {
  ReactResult,
  ReactRef,
} from "@allthethings/ui";
import type { PureQueryOptions } from "@apollo/client";
import {
  IconButton,
  ListItem,
  createStyles,
  makeStyles,
  Tooltip,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import clsx from "clsx";
import { DateTime } from "luxon";
import { forwardRef, useCallback, useMemo, useRef } from "react";
import type { DropTargetMonitor } from "react-dnd";
import mergeRefs from "react-merge-refs";

import {
  useArchiveItemMutation,
  useDeleteItemMutation,
  useEditTaskControllerMutation,
  useSnoozeItemMutation,
} from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import TaskDialog from "../ui/TaskDialog";
import { item as arrayItem } from "../utils/collections";
import type { DraggedItem, ItemDragResult } from "../utils/drag";
import { useDragResult, DragType, useDropArea, useItemDrag } from "../utils/drag";
import type { Inbox, Item, Item as ItemState, Section, TaskList } from "../utils/state";
import { isInbox, isFileItem, isLinkItem, isNoteItem, isPluginItem } from "../utils/state";
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
      overflow: "hidden",
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
      overflow: "hidden",
    },
    actions: {
      ...Styles.flexRow,
      alignItems: "center",
      justifyContent: "end",
      paddingLeft: theme.spacing(1),
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

interface TypeIconProps {
  controller: TaskController | null;
}

const TypeIcon = ReactMemo(function TypeIcon({
  controller,
}: TypeIconProps): ReactResult {
  switch (controller) {
    case null:
      return <Icons.NoTask/>;
    case TaskController.Manual:
      return <Icons.ManualTask/>;
    case TaskController.Plugin:
      return <Icons.PluginTask/>;
    case TaskController.PluginList:
      return <Icons.ListTask/>;
  }
});

function titleForType(type: TaskController | null): string {
  switch (type) {
    case null:
      return "Not a task";
    case TaskController.Manual:
      return "Manually controlled";
    case TaskController.Plugin:
      return "Plugin controlled";
    case TaskController.PluginList:
      return "Controlled by plugin lists";
  }
}

interface TypeMenuItemProps {
  item: Item;
  refetchQueries: PureQueryOptions[];
  controller: TaskController | null;
  selectedController: TaskController | null;
}

const TypeMenuItem = ReactMemo(forwardRef(function TypeMenuItem({
  item,
  refetchQueries,
  controller,
  selectedController,
}: TypeMenuItemProps, ref: ReactRef | null): ReactResult {
  let [mutate, { error }] = useEditTaskControllerMutation({
    variables: {
      id: item.id,
      controller,
    },
    refetchQueries,
  });

  if (error) {
    console.log(error);
  }

  let click = useCallback(() => {
    if (controller == selectedController) {
      return;
    }

    void mutate();
  }, [controller, selectedController, mutate]);

  return <MenuItem
    ref={ref}
    selected={controller == selectedController}
    disabled={controller == selectedController}
    onClick={click}
  >
    <ListItemIcon>
      <TypeIcon controller={controller}/>
    </ListItemIcon>
    <ListItemText>{titleForType(controller)}</ListItemText>
  </MenuItem>;
}));

interface ItemProps {
  taskList: TaskList | Inbox;
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

export default ReactMemo(function ItemDisplay({
  item,
  section,
  taskList,
  items,
  index,
}: ItemProps): ReactResult {
  let classes = useStyles();

  let typeMenuState = useMenuState("task-type");

  let { wasEverListed, isCurrentlyListed, hasTaskState, taskController } = useMemo(() => {
    let taskController = item.taskInfo?.controller ?? null;

    if (isPluginItem(item)) {
      return {
        taskController,
        isCurrentlyListed: item.detail.isCurrentlyListed,
        wasEverListed: item.detail.wasEverListed,
        hasTaskState: item.detail.hasTaskState,
      };
    }

    return {
      taskController,
      isCurrentlyListed: false,
      wasEverListed: false,
      hasTaskState: false,
    };
  }, [item]);

  let [editDialogOpen, openEditDialog, closeEditDialog] = useBoolState();

  let refetchQueries: PureQueryOptions[] = [
    refetchListContextStateQuery(),
  ];

  if (!isInbox(taskList)) {
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
        if (isInbox(taskList) || !elementRef.current) {
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

  let typeMenuItemProps: Omit<TypeMenuItemProps, "controller"> = {
    refetchQueries,
    selectedController: taskController,
    item,
  };

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
        <Tooltip title={titleForType(taskController)}>
          <IconButton {...bindTrigger(typeMenuState)}>
            <TypeIcon controller={taskController}/>
          </IconButton>
        </Tooltip>
        <Menu
          state={typeMenuState}
          anchor={
            {
              vertical: "bottom",
              horizontal: "right",
            }
          }
        >
          <TypeMenuItem {...typeMenuItemProps} controller={null}/>
          <TypeMenuItem {...typeMenuItemProps} controller={TaskController.Manual}/>
          {
            hasTaskState && <TypeMenuItem
              {...typeMenuItemProps}
              controller={TaskController.Plugin}
            />
          }
          {
            wasEverListed && <TypeMenuItem
              {...typeMenuItemProps}
              controller={TaskController.PluginList}
            />
          }
        </Menu>
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
          // eslint-disable-next-line react/jsx-no-useless-fragment
          !isInbox(taskList) && <>
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
          </>
        }
        {
          !isPluginItem(item) && <Tooltip title="Edit">
            <IconButton onClick={openEditDialog}>
              <Icons.Edit/>
            </IconButton>
          </Tooltip>
        }
        {
          !isCurrentlyListed && <Tooltip title="Delete">
            <IconButton onClick={deleteItem}>
              <Icons.Delete/>
            </IconButton>
          </Tooltip>
        }
      </div>
    </ListItem>
    {editDialogOpen && renderEditDialog(item, closeEditDialog)}
  </>;
});
