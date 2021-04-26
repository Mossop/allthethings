import type { BugRecord, SearchPresence } from "@allthethings/bugzilla-server";
import { TaskType } from "@allthethings/bugzilla-server";
import type { PluginItem, PluginItemProps, ReactRef, ReactResult } from "@allthethings/ui";
import {
  Icons,
  ImageIcon,
  useMenuState,
  bindTrigger,
  Menu,
  TaskDoneToggle,
  Styles,
  ReactMemo,
} from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import {
  makeStyles,
  createStyles,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@material-ui/core";
import CloudIcon from "@material-ui/icons/Cloud";
import DescriptionIcon from "@material-ui/icons/Description";
import PersonIcon from "@material-ui/icons/Person";
import SearchIcon from "@material-ui/icons/Search";
import { useMemo, useCallback, forwardRef } from "react";

import Icon from "./Icon";
import { useDeleteItemMutation, useSetItemTaskTypeMutation } from "./schema";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      ...Styles.flexRow,
      alignItems: "center",
      flex: 1,
      cursor: "pointer",
      overflow: "hidden",
    },
    iconContainer: {
      padding: theme.spacing(1.5),
      ...Styles.flexCentered,
    },
    summary: {
      flex: 1,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
    status: {
      paddingLeft: theme.spacing(1),
      textTransform: "uppercase",
      fontSize: "0.7rem",
    },
    resolution: {
      paddingLeft: "0.5em",
      textTransform: "uppercase",
      fontSize: "0.7rem",
    },
  }));

interface TypeIconProps {
  taskType: TaskType;
}

const TypeIcon = ReactMemo(function TypeIcon({
  taskType,
}: TypeIconProps): ReactResult {
  switch (taskType) {
    case TaskType.None:
      return <DescriptionIcon/>;
    case TaskType.Manual:
      return <PersonIcon/>;
    case TaskType.Resolved:
      return <CloudIcon/>;
    case TaskType.Search:
      return <SearchIcon/>;
  }
});

function titleForType(type: TaskType): string {
  switch (type) {
    case TaskType.None:
      return "Not a task";
    case TaskType.Manual:
      return "Manually controlled";
    case TaskType.Resolved:
      return "Mirror bug status";
    case TaskType.Search:
      return "From searches";
  }
}

type TypeMenuItemProps = PluginItemProps & {
  item: PluginItem;
  taskType: TaskType;
  selectedType: TaskType;
  disabled?: boolean;
};

const TypeMenuItem = ReactMemo(forwardRef(function TypeMenuItem({
  item,
  refetchQueries,
  taskType,
  selectedType,
  disabled = false,
}: TypeMenuItemProps, ref: ReactRef | null): ReactResult {
  let [mutate, { error }] = useSetItemTaskTypeMutation({
    variables: {
      item: item.id,
      taskType,
    },
    refetchQueries,
  });

  if (error) {
    console.log(error);
  }

  let click = useCallback(() => {
    if (taskType == selectedType) {
      return;
    }

    void mutate();
  }, [taskType, selectedType]);

  return <MenuItem
    ref={ref}
    selected={taskType == selectedType}
    disabled={disabled || taskType == selectedType}
    onClick={click}
  >
    <ListItemIcon>
      <TypeIcon taskType={taskType}/>
    </ListItemIcon>
    <ListItemText>{titleForType(taskType)}</ListItemText>
  </MenuItem>;
}));

export default ReactMemo(function Bug({
  item,
  refetchQueries,
}: PluginItemProps): ReactResult {
  let classes = useStyles();
  let typeMenuState = useMenuState("bug-type");

  let bug = JSON.parse(item.detail.fields) as BugRecord;

  let baseProps = useMemo(() => ({
    item,
    refetchQueries,
    selectedType: bug.taskType,
  }), [item, bug]);

  let [deleteItemMutation] = useDeleteItemMutation({
    variables: {
      id: item.id,
    },
    refetchQueries,
  });

  let deleteItem = useCallback(() => deleteItemMutation(), [deleteItemMutation]);

  let isInSearch = useMemo(
    () => !bug.searches.every((presence: SearchPresence): boolean => !presence.present),
    [bug],
  );

  return <>
    <TaskDoneToggle item={item} disabled={bug.taskType != TaskType.Manual}/>
    <a className={classes.link} rel="noreferrer" target="_blank" href={bug.url}>
      <div className={classes.iconContainer}>
        <ImageIcon icon={bug.icon ?? <Icon/>}/>
      </div>
      <div className={classes.summary}>{bug.summary}</div>
      <div className={classes.status}>{bug.status}</div>
      {bug.resolution && <div className={classes.resolution}>{bug.resolution}</div>}
    </a>
    <Tooltip title={titleForType(bug.taskType)}>
      <IconButton {...bindTrigger(typeMenuState)}>
        <TypeIcon taskType={bug.taskType}/>
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
      <TypeMenuItem {...baseProps} taskType={TaskType.None}/>
      <TypeMenuItem {...baseProps} taskType={TaskType.Manual}/>
      <TypeMenuItem {...baseProps} taskType={TaskType.Resolved}/>
      {isInSearch && <TypeMenuItem {...baseProps} taskType={TaskType.Search}/>}
    </Menu>
    <Tooltip title="Delete">
      <IconButton onClick={deleteItem} disabled={isInSearch}>
        <Icons.Delete/>
      </IconButton>
    </Tooltip>
  </>;
});
