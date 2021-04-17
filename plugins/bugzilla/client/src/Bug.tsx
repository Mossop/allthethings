import type { BugRecord } from "@allthethings/bugzilla-server";
import { TaskType } from "@allthethings/bugzilla-server";
import type { PluginItem, PluginItemProps, ReactRef, ReactResult } from "@allthethings/ui";
import {
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
import { useSetItemTaskTypeMutation } from "./schema";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      ...Styles.flexRow,
      alignItems: "center",
      flex: 1,
      cursor: "pointer",
    },
    iconContainer: {
      padding: theme.spacing(1.5),
      ...Styles.flexCentered,
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
};

const TypeMenuItem = ReactMemo(forwardRef(function TypeMenuItem({
  item,
  refetchQueries,
  taskType,
  selectedType,
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
    disabled={taskType == selectedType}
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

  return <>
    <TaskDoneToggle item={item} disabled={bug.taskType != TaskType.Manual}/>
    <a className={classes.link} rel="noreferrer" target="_blank" href={bug.url}>
      <div className={classes.iconContainer}>
        <Icon/>
      </div>
      <div>{bug.summary}</div>
    </a>
    <Tooltip title="Resolves by...">
      <IconButton {...bindTrigger(typeMenuState)} title={titleForType(bug.taskType)}>
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
      <TypeMenuItem {...baseProps} taskType={TaskType.Search}/>
    </Menu>
  </>;
});
