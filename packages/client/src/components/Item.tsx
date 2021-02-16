import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { useCallback } from "react";

import { useDeleteItemMutation } from "../schema/mutations";
import { refetchListTaskListQuery } from "../schema/queries";
import type { Item as ItemState, Section, TaskList } from "../utils/state";
import { dragging, flexCentered, flexRow } from "../utils/styles";
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
  section: Section | null;
  item: ItemState;
}

export default ReactMemo(function Item({
  item,
  section,
  taskList,
}: ItemProps): ReactResult {
  let inner: ReactResult;
  switch (item.__typename) {
    case "Task":
      inner = <TaskItem item={item} section={section} taskList={taskList}/>;
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
    className={clsx(classes.item)}
    disableGutters={true}
  >
    <div className={classes.dragHandleContainer}>
      <DragIcon className={classes.dragHandle}/>
    </div>
    <div className={classes.itemInner}>
      {inner}
    </div>
    <div className={classes.actions}>
      <IconButton onClick={deleteItem}>
        <DeleteIcon/>
      </IconButton>
    </div>
  </ListItem>;
});
