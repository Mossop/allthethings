import type { PureQueryOptions } from "@apollo/client";
import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { useCallback, useRef } from "react";
import type { DropTargetMonitor } from "react-dnd";
import mergeRefs from "react-merge-refs";

import { useDeleteItemMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import TaskDialog from "../ui/TaskDialog";
import { item as arrayItem } from "../utils/collections";
import type { DraggedItem, ItemDragResult } from "../utils/drag";
import { useDragResult, DragType, useDropArea, useItemDrag } from "../utils/drag";
import { useBoolState } from "../utils/hooks";
import type { Item, Item as ItemState, Section, TaskList } from "../utils/state";
import { dragging, flexCentered, flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import FileItem from "./FileItem";
import { DragIcon, DeleteIcon, EditIcon } from "./Icons";
import LinkItem from "./LinkItem";
import NoteItem from "./NoteItem";
import PluginItem from "./PluginItem";
import TaskItem from "./TaskItem";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    item: {
      ...flexRow,
      "alignItems": "center",
      "fontSize": "1.1rem",
      "&:hover": {
        backgroundColor: theme.palette.text.secondary,
        color: theme.palette.getContrastText(theme.palette.text.secondary),
      },
    },
    dragPreview: {
      flex: 1,
      ...flexRow,
      alignItems: "center",
    },
    hidden: {
      display: "none",
    },
    dragging: {
      ...dragging,
    },
    dragHandleContainer: {
      ...flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    itemInner: {
      flex: 1,
      ...flexRow,
      alignItems: "center",
    },
    actions: {
      ...flexRow,
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
  switch (item.__typename) {
    case "Task":
      return <TaskItem item={item} section={section} taskList={taskList} isDragging={isDragging}/>;
    case "Note":
      return <NoteItem item={item}/>;
    case "File":
      return <FileItem item={item}/>;
    case "Link":
      return <LinkItem item={item}/>;
    case "PluginItem":
      return <PluginItem item={item}/>;
  }
}

function renderEditDialog(item: Item, onClose: () => void): ReactResult {
  switch (item.__typename) {
    case "Task":
      return <TaskDialog task={item} onClose={onClose}/>;
    case "Note":
      return <div/>;
    case "File":
      return <div/>;
    case "Link":
      return <div/>;
    case "PluginItem":
      throw new Error("Cannot edit plugin items.");
  }
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
        <DragIcon className={classes.dragHandle}/>
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
          <DragIcon className={classes.dragHandle}/>
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
        <IconButton onClick={openEditDialog}>
          <EditIcon/>
        </IconButton>
        <IconButton onClick={deleteItem}>
          <DeleteIcon/>
        </IconButton>
      </div>
    </ListItem>
    {editDialogOpen && renderEditDialog(item, closeEditDialog)}
  </>;
});
