import MenuIcon from "@mui/icons-material/MoreVert";
import {
  IconButton,
  Tooltip,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { useMemo } from "react";

import type { ReactResult } from "../../utils";
import {
  Icons,
  Styles,
  ReactMemo,
  useBoolState,
  bindTrigger,
  useMenuState,
  Menu,
} from "../../utils";
import CreateSectionDialog from "../dialogs/CreateSection";
import LinkDialog from "../dialogs/Link";
import TaskDialog from "../dialogs/Task";
import type { Inbox, TaskList, Section } from "../schema";
import { isContext, isInbox, isProject, isTaskList } from "../schema";
import {
  useDeleteSectionMutation,
  useDeleteProjectMutation,
  useDeleteContextMutation,
} from "../utils/api";
import { useUser } from "../utils/globalState";
import { ViewType, replaceView, useLoggedInView } from "../utils/view";

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      flex: 1,
      ...Styles.flexCenteredRow,
      justifyContent: "end",
    },
  }),
);

interface ItemListActionsProps {
  list: Inbox | TaskList | Section;
}

export default ReactMemo(function ItemListActions({
  list,
}: ItemListActionsProps): ReactResult {
  let classes = useStyles();
  let view = useLoggedInView();
  let user = useUser();

  let actionMenu = useMenuState("list-actions");

  let [sectionAddDialogOpen, openAddSection, closeAddSection] = useBoolState();
  let [taskAddDialogOpen, openAddTask, closeAddTask] = useBoolState();
  let [linkAddDialogOpen, openAddLink, closeAddLink] = useBoolState();

  let [deleteSection] = useDeleteSectionMutation();
  let [deleteProject] = useDeleteProjectMutation();
  let [deleteContext] = useDeleteContextMutation();

  let deleteList = useMemo(() => {
    if ((isContext(list) && list === user.defaultContext) || isInbox(list)) {
      return null;
    }

    return async () => {
      if (isProject(list)) {
        await deleteProject({
          id: list.id,
        });

        replaceView({
          type: ViewType.TaskList,
          taskList: list.parent ?? view.context,
        });
      } else if (isContext(list)) {
        await deleteContext({
          id: list.id,
        });

        replaceView({
          type: ViewType.TaskList,
          taskList: user.defaultContext,
          context: user.defaultContext,
        });
      } else {
        await deleteSection({
          id: list.id,
        });
      }
    };
  }, [deleteContext, deleteProject, deleteSection, list, view, user]);

  return (
    <div className={classes.actions}>
      <Tooltip title="Add Task">
        <IconButton onClick={openAddTask}>
          <Icons.Checked />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add Link">
        <IconButton onClick={openAddLink}>
          <Icons.Link />
        </IconButton>
      </Tooltip>
      {isTaskList(list) && (
        <Tooltip title="Add Section">
          <IconButton onClick={openAddSection}>
            <Icons.Section />
          </IconButton>
        </Tooltip>
      )}
      {deleteList && (
        <>
          <IconButton {...bindTrigger(actionMenu)}>
            <MenuIcon />
          </IconButton>
          <Menu
            state={actionMenu}
            anchor={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={deleteList}>
              <ListItemIcon>
                <Icons.Delete />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
      {taskAddDialogOpen && <TaskDialog list={list} onClosed={closeAddTask} />}
      {linkAddDialogOpen && <LinkDialog list={list} onClosed={closeAddLink} />}
      {sectionAddDialogOpen && isTaskList(list) && (
        <CreateSectionDialog taskList={list} onClosed={closeAddSection} />
      )}
    </div>
  );
});
