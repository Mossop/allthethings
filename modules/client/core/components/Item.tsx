import {
  IconButton,
  ListItem,
  Tooltip,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import { DateTime } from "luxon";
import { forwardRef, useCallback, useMemo, useState } from "react";

import type { ReactResult, ReactRef } from "../../utils";
import {
  Icons,
  Styles,
  ReactMemo,
  useMenuState,
  bindTrigger,
  Menu,
  TaskController,
} from "../../utils";
import type { Item } from "../schema";
import {
  isInbox,
  isNoteItem,
  isFileItem,
  isLinkItem,
  isServiceItem,
  itemTaskList,
} from "../schema";
import { useEditItemMutation, useEditTaskController } from "../utils/api";
import { useDragSource } from "../utils/drag";
import type { ListFilter } from "../utils/filter";
import { isVisible } from "../utils/filter";
import { DueMenuButton } from "./DueMenu";
import FileItem from "./FileItem";
import ItemMenuButton from "./ItemMenu";
import LinkItem from "./LinkItem";
import NoteItem from "./NoteItem";
import ServiceItem from "./ServiceItem";
import { SnoozeMenuButton } from "./SnoozeMenu";
import { TaskDoneToggle } from "./TaskDoneToggle";
import TaskItem from "./TaskItem";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    item: {
      ...Styles.flexCenteredRow,
      fontSize: "1.1rem",
      opacity: 1,
      transitionProperty: "opacity",
      transitionDuration: "1.5s",
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
  }),
);

function renderItem({ item, isDragging }: ItemRenderProps): ReactResult {
  if (isNoteItem(item)) return <NoteItem item={item} isDragging={isDragging} />;
  if (isFileItem(item)) return <FileItem item={item} isDragging={isDragging} />;
  if (isLinkItem(item)) return <LinkItem item={item} isDragging={isDragging} />;
  if (isServiceItem(item))
    return <ServiceItem item={item} isDragging={isDragging} />;
  return <TaskItem item={item} isDragging={isDragging} />;
}

interface TypeIconProps {
  controller: TaskController | null;
}

const TypeIcon = ReactMemo(function TypeIcon({
  controller,
}: TypeIconProps): ReactResult {
  switch (controller) {
    case null:
      return <Icons.NoTask />;
    case TaskController.Manual:
      return <Icons.ManualTask />;
    case TaskController.Service:
      return <Icons.ServiceTask />;
    case TaskController.ServiceList:
      return <Icons.ListTask />;
  }
});

function titleForType(type: TaskController | null): string {
  switch (type) {
    case null:
      return "Not a task";
    case TaskController.Manual:
      return "Manually controlled";
    case TaskController.Service:
      return "Service controlled";
    case TaskController.ServiceList:
      return "Controlled by service lists";
  }
}

interface TypeMenuItemProps {
  item: Item;
  controller: TaskController | null;
  selectedController: TaskController | null;
}

const TypeMenuItem = ReactMemo(
  forwardRef(function TypeMenuItem(
    { item, controller, selectedController }: TypeMenuItemProps,
    ref: ReactRef | null,
  ): ReactResult {
    let [editTaskController] = useEditTaskController();

    let click = useCallback(() => {
      if (controller == selectedController) {
        return;
      }

      void editTaskController({
        id: item.id,
        controller,
      });
    }, [controller, selectedController, editTaskController, item.id]);

    return (
      <MenuItem
        ref={ref}
        selected={controller == selectedController}
        disabled={controller == selectedController}
        onClick={click}
      >
        <ListItemIcon>
          <TypeIcon controller={controller} />
        </ListItemIcon>
        <ListItemText>{titleForType(controller)}</ListItemText>
      </MenuItem>
    );
  }),
);

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

    if (isServiceItem(item)) {
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

  let [editItemMutation] = useEditItemMutation();

  let archiveItem = useCallback(() => {
    if (item.archived) {
      return editItemMutation({
        id: item.id,
        params: {
          archived: null,
        },
      });
    } else {
      return editItemMutation({
        id: item.id,
        params: {
          archived: DateTime.now().toISO(),
        },
      });
    }
  }, [item, editItemMutation]);

  let typeMenuItemProps: Omit<TypeMenuItemProps, "controller"> = {
    selectedController: taskController,
    item,
  };

  let visible = isVisible(item, filter);
  let [currentlyVisible, setCurrentlyVisible] = useState(visible);

  if (visible && !currentlyVisible) {
    setCurrentlyVisible(true);
  }

  let transitionEnd = useCallback(
    () => setCurrentlyVisible(visible),
    [visible],
  );

  let { isDragging, dragRef, previewRef } = useDragSource(item);

  if (!visible && !currentlyVisible) {
    return null;
  }

  return (
    <ListItem
      className={clsx(
        classes.item,
        !visible && classes.hiding,
        isDragging && classes.dragging,
      )}
      disableGutters={true}
      onTransitionEnd={transitionEnd}
    >
      <div className={classes.dragPreview} ref={previewRef}>
        <div ref={dragRef} className={classes.dragHandleContainer}>
          <Icons.Drag className={classes.dragHandle} />
        </div>
        <TaskDoneToggle item={item} />
        <div className={classes.itemInner}>
          {renderItem({
            item,
            isDragging: false,
          })}
        </div>
      </div>
      <div className={classes.actions}>
        <Tooltip title={titleForType(taskController)}>
          <IconButton {...bindTrigger(typeMenuState)}>
            <TypeIcon controller={taskController} />
          </IconButton>
        </Tooltip>
        <Menu
          state={typeMenuState}
          anchor={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <TypeMenuItem {...typeMenuItemProps} controller={null} />
          <TypeMenuItem
            {...typeMenuItemProps}
            controller={TaskController.Manual}
          />
          {hasTaskState && (
            <TypeMenuItem
              {...typeMenuItemProps}
              controller={TaskController.Service}
            />
          )}
          {wasEverListed && (
            <TypeMenuItem
              {...typeMenuItemProps}
              controller={TaskController.ServiceList}
            />
          )}
        </Menu>
        <DueMenuButton item={item} />
        <SnoozeMenuButton item={item} />
        {
          // eslint-disable-next-line react/jsx-no-useless-fragment
          !isInbox(itemTaskList(item)) &&
            (item.archived ? (
              <Tooltip title="Unarchive">
                <IconButton onClick={archiveItem} color="primary">
                  <Icons.Unarchive />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Archive">
                <IconButton onClick={archiveItem}>
                  <Icons.Archive />
                </IconButton>
              </Tooltip>
            ))
        }
        <ItemMenuButton item={item} />
      </div>
    </ListItem>
  );
});
