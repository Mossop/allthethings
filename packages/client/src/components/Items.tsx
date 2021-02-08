import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useCallback } from "react";

import { useDeleteItemMutation } from "../schema/mutations";
import { refetchListTaskListQuery } from "../schema/queries";
import { DragType, useDrag } from "../utils/drag";
import type { Item as ItemState, TaskList } from "../utils/state";
import { flexCentered, flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import FileItem from "./FileItem";
import { DragIcon, DeleteIcon } from "./Icons";
import LinkItem from "./LinkItem";
import NoteItem from "./NoteItem";
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
    dragHandleContainer: {
      ...flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    itemInner: {
      ...flexRow,
      alignItems: "center",
    },
    actions: {
      flex: 1,
      ...flexRow,
      alignItems: "center",
      justifyContent: "end",
    },
  }));

interface ItemProps {
  taskList: TaskList;
  item: ItemState;
}

const Item = ReactMemo(function Item({
  item,
  taskList,
}: ItemProps): ReactResult {
  let inner: ReactResult;
  switch (item.__typename) {
    case "Task":
      inner = <TaskItem item={item}/>;
      break;
    case "Note":
      inner = <NoteItem item={item}/>;
      break;
    case "File":
      inner = <FileItem item={item}/>;
      break;
    case "Link":
      inner = <LinkItem item={item}/>;
      break;
  }

  let classes = useStyles();

  let [, dragRef, previewRef] = useDrag({
    item: {
      type: DragType.Item,
      item,
    },
  });

  let [deleteItemMutation] = useDeleteItemMutation({
    variables: {
      id: item.id,
    },
    refetchQueries: [
      refetchListTaskListQuery({
        taskList: taskList.id,
      }),
    ],
  });

  let deleteItem = useCallback(() => deleteItemMutation(), [deleteItemMutation]);

  return <ListItem
    className={classes.item}
    disableGutters={true}
  >
    <div ref={dragRef} className={classes.dragHandleContainer}>
      <DragIcon className={classes.dragHandle}/>
    </div>
    <div className={classes.itemInner} ref={previewRef}>
      {inner}
    </div>
    <div className={classes.actions}>
      <IconButton onClick={deleteItem}>
        <DeleteIcon/>
      </IconButton>
    </div>
  </ListItem>;
});

interface ItemsProps {
  items: readonly ItemState[];
  taskList: TaskList;
}

export default ReactMemo(function Items({
  items,
  taskList,
}: ItemsProps): ReactResult {
  return <>
    {items.map((item: ItemState) => <Item key={item.id} taskList={taskList} item={item}/>)}
  </>;
});
