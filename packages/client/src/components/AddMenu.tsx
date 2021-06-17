import type { ReactResult } from "@allthethings/ui";
import { useBoolState, useMenuState, bindTrigger, Icons, ReactMemo, Menu } from "@allthethings/ui";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@material-ui/core";

import { isTaskList } from "../schema";
import type { Inbox, TaskList, Section } from "../schema";
import CreateSectionDialog from "../ui/CreateSectionDialog";
import LinkDialog from "../ui/LinkDialog";
import TaskDialog from "../ui/TaskDialog";

interface AddMenuProps {
  list: Inbox | TaskList | Section;
}

export default ReactMemo(function AddMenu({
  list,
}: AddMenuProps): ReactResult {
  let addMenuState = useMenuState("add");

  let [sectionAddDialogOpen, openAddSection, closeAddSection] = useBoolState();
  let [taskAddDialogOpen, openAddTask, closeAddTask] = useBoolState();
  let [linkAddDialogOpen, openAddLink, closeAddLink] = useBoolState();

  return <>
    <Tooltip title="Add">
      <IconButton {...bindTrigger(addMenuState)}>
        <Icons.Add/>
      </IconButton>
    </Tooltip>
    <Menu
      state={addMenuState}
      anchor={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
    >
      <MenuItem onClick={openAddTask}>
        <ListItemIcon>
          <Icons.Checked/>
        </ListItemIcon>
        <ListItemText>Add Task</ListItemText>
      </MenuItem>
      <MenuItem onClick={openAddLink}>
        <ListItemIcon>
          <Icons.Link/>
        </ListItemIcon>
        <ListItemText>Add Link</ListItemText>
      </MenuItem>
      {
        isTaskList(list) && <MenuItem onClick={openAddSection}>
          <ListItemIcon>
            <Icons.Section/>
          </ListItemIcon>
          <ListItemText>Add Section</ListItemText>
        </MenuItem>
      }
    </Menu>
    {taskAddDialogOpen && <TaskDialog list={list} onClosed={closeAddTask}/>}
    {linkAddDialogOpen && <LinkDialog list={list} onClosed={closeAddLink}/>}
    {
      sectionAddDialogOpen && isTaskList(list) &&
      <CreateSectionDialog taskList={list} onClosed={closeAddSection}/>
    }
  </>;
});
