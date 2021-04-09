import type { BugRecord } from "@allthethings/bugzilla-server";
import { TaskType } from "@allthethings/bugzilla-server";
import type { PluginItem, ReactResult } from "@allthethings/ui";
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
} from "@material-ui/core";
import CloudIcon from "@material-ui/icons/Cloud";
import DescriptionIcon from "@material-ui/icons/Description";
import PersonIcon from "@material-ui/icons/Person";
import SearchIcon from "@material-ui/icons/Search";

import Icon from "./Icon";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      ...Styles.flexRow,
      alignItems: "center",
      flex: 1,
      cursor: "pointer",
    },
    iconContainer: {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
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

interface TypeMenuItemProps {
  taskType: TaskType;
  selectedType: TaskType;
}

const TypeMenuItem = ReactMemo(function TypeMenuItem({
  taskType,
  selectedType,
}: TypeMenuItemProps): ReactResult {
  return <MenuItem selected={taskType == selectedType}>
    <ListItemIcon>
      <TypeIcon taskType={taskType}/>
    </ListItemIcon>
    <ListItemText>{titleForType(taskType)}</ListItemText>
  </MenuItem>;
});

export interface BugProps {
  item: PluginItem;
}

export default ReactMemo(function Bug({
  item,
}: BugProps): ReactResult {
  let classes = useStyles();
  let typeMenuState = useMenuState("bug-type");

  let bug = JSON.parse(item.detail.fields) as BugRecord;

  return <>
    <TaskDoneToggle item={item}/>
    <a className={classes.link} rel="noreferrer" target="_blank" href={bug.url}>
      <div className={classes.iconContainer}>
        <Icon/>
      </div>
      <div>{bug.summary}</div>
    </a>
    <IconButton {...bindTrigger(typeMenuState)} title={titleForType(bug.taskType)}>
      <TypeIcon taskType={bug.taskType}/>
    </IconButton>
    <Menu
      state={typeMenuState}
      anchor={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
    >
      <TypeMenuItem selectedType={bug.taskType} taskType={TaskType.None}/>
      <TypeMenuItem selectedType={bug.taskType} taskType={TaskType.Manual}/>
      <TypeMenuItem selectedType={bug.taskType} taskType={TaskType.Resolved}/>
      <TypeMenuItem selectedType={bug.taskType} taskType={TaskType.Search}/>
    </Menu>
  </>;
});
