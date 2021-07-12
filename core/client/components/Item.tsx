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
import { forwardRef, useCallback, useMemo, useState } from "react";

import type {
  ReactResult,
  ReactRef,
  RefetchQueries,
} from "#client-utils";
import {
  Icons,
  Styles,
  ReactMemo,
  useMenuState,
  bindTrigger,
  Menu,
} from "#client-utils";
import { TaskController } from "#schema";

import type { Item } from "../schema";
import {
  isInbox,
  useArchiveItemMutation,
  useEditTaskControllerMutation,
  refetchQueriesForItem,
  isNoteItem,
  isFileItem,
  isLinkItem,
  isPluginItem,
  itemTaskList,
} from "../schema";
import { useDragSource } from "../utils/drag";
import type { ListFilter } from "../utils/filter";
import { isVisible } from "../utils/filter";
import DueMenu from "./DueMenu";
import FileItem from "./FileItem";
import ItemMenu from "./ItemMenu";
import LinkItem from "./LinkItem";
import NoteItem from "./NoteItem";
import PluginItem from "./PluginItem";
import SnoozeMenu from "./SnoozeMenu";
import { TaskDoneToggle } from "./TaskDoneToggle";
import TaskItem from "./TaskItem";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    item: {
      ...Styles.flexCenteredRow,
      "fontSize": "1.1rem",
      "opacity": 1,
      "transitionProperty": "opacity",
      "transitionDuration": "1.5s",
      "&:hover": {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
      },
    },
    dragPreview: {
      flex: 1,
      ...Styles.flexCenteredRow,
      overflow: "hidden",
    },
    dragHandleContainer: {
      ...Styles.flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    itemInner: {
      flex: 1,
      ...Styles.flexCenteredRow,
      overflow: "hidden",
    },
    actions: {
      ...Styles.flexCenteredRow,
      justifyContent: "end",
      paddingLeft: theme.spacing(1),
    },
    hiding: {
      opacity: 0,
    },
    dragging: {
      display: "none",
    },
  }));

function renderItem({
  item,
  isDragging,
}: ItemRenderProps): ReactResult {
  if (isNoteItem(item))
    return <NoteItem item={item} isDragging={isDragging}/>;
  if (isFileItem(item))
    return <FileItem item={item} isDragging={isDragging}/>;
  if (isLinkItem(item))
    return <LinkItem item={item} isDragging={isDragging}/>;
  if (isPluginItem(item))
    return <PluginItem item={item} isDragging={isDragging}/>;
  return <TaskItem item={item} isDragging={isDragging}/>;
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
  refetchQueries: RefetchQueries;
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
  item: Item;
  filter: ListFilter;
}

export type ItemRenderProps = Pick<ItemProps, "item"> & {
  isDragging: boolean;
};

export default ReactMemo(function ItemDisplay({
  item,
  filter,
}: ItemProps): ReactResult {
  let classes = useStyles();

  let typeMenuState = useMenuState("task-type");

  let { wasEverListed, hasTaskState, taskController } = useMemo(() => {
    let taskController = item.taskInfo?.controller ?? null;

    if (isPluginItem(item)) {
      return {
        taskController,
        wasEverListed: item.detail.wasEverListed,
        hasTaskState: item.detail.hasTaskState,
      };
    }

    return {
      taskController,
      wasEverListed: false,
      hasTaskState: false,
    };
  }, [item]);

  let refetchQueries = refetchQueriesForItem(item);

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

  let typeMenuItemProps: Omit<TypeMenuItemProps, "controller"> = {
    refetchQueries,
    selectedController: taskController,
    item,
  };

  let visible = isVisible(item, filter);
  let [currentlyVisible, setCurrentlyVisible] = useState(visible);

  if (visible && !currentlyVisible) {
    setCurrentlyVisible(true);
  }

  let transitionEnd = useCallback(() => setCurrentlyVisible(visible), [visible]);

  let {
    isDragging,
    dragRef,
    previewRef,
  } = useDragSource(item);

  if (!visible && !currentlyVisible) {
    return null;
  }

  return <ListItem
    className={clsx(classes.item, !visible && classes.hiding, isDragging && classes.dragging)}
    disableGutters={true}
    onTransitionEnd={transitionEnd}
  >
    <div className={classes.dragPreview} ref={previewRef}>
      <div ref={dragRef} className={classes.dragHandleContainer}>
        <Icons.Drag className={classes.dragHandle}/>
      </div>
      <TaskDoneToggle item={item}/>
      <div className={classes.itemInner}>
        {
          renderItem({
            item,
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
      <DueMenu item={item}/>
      <SnoozeMenu item={item}/>
      {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        !isInbox(itemTaskList(item)) && <>
          {
            item.archived
              ? <Tooltip title="Unarchive">
                <IconButton onClick={archiveItem} color="primary">
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
      <ItemMenu item={item}/>
    </div>
  </ListItem>;
});
