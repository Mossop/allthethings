import {
  IconButton,
  createStyles,
  makeStyles,
  Tooltip,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/MoreVert";
import { useMemo } from "react";

import type { ReactResult } from "#client/utils";
import {
  Icons,
  Styles,
  ReactMemo,
  useBoolState,
  bindTrigger,
  useMenuState,
  Menu,
} from "#client/utils";

import CreateSectionDialog from "../dialogs/CreateSection";
import LinkDialog from "../dialogs/Link";
import TaskDialog from "../dialogs/Task";
import type { Inbox, TaskList, Section } from "../schema";
import {
  OperationNames,
  isContext,
  isInbox,
  isProject,
  useDeleteContextMutation,
  useDeleteProjectMutation,
  useDeleteSectionMutation,
  refetchQueriesForSection,
  isTaskList,
} from "../schema";
import { useUser } from "../utils/globalState";
import { ViewType, replaceView, useLoggedInView } from "../utils/view";

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      flex: 1,
      ...Styles.flexCenteredRow,
      justifyContent: "end",
    },
  }));

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
  let [deleteProject] = useDeleteProjectMutation({
    refetchQueries: [
      OperationNames.Query.ListContextState,
    ],
  });
  let [deleteContext] = useDeleteContextMutation({
    refetchQueries: [
      OperationNames.Query.ListContextState,
    ],
  });

  let deleteList = useMemo(() => {
    if (isContext(list) && list === user.defaultContext || isInbox(list)) {
      return null;
    }

    return () => {
      if (isProject(list)) {
        replaceView({
          type: ViewType.TaskList,
          taskList: list.parent ?? view.context,
        });

        void deleteProject({
          variables: {
            id: list.id,
          },
        });
      } else if (isContext(list)) {
        replaceView({
          type: ViewType.TaskList,
          taskList: user.defaultContext,
          context: user.defaultContext,
        });

        void deleteContext({
          variables: {
            id: list.id,
          },
        });
      } else {
        void deleteSection({
          variables: {
            id: list.id,
          },
          refetchQueries: refetchQueriesForSection(list.taskList),
        });
      }
    };
  }, [deleteContext, deleteProject, deleteSection, list, view, user]);

  return <div className={classes.actions}>
    <Tooltip title="Add Task">
      <IconButton onClick={openAddTask}>
        <Icons.Checked/>
      </IconButton>
    </Tooltip>
    <Tooltip title="Add Link">
      <IconButton onClick={openAddLink}>
        <Icons.Link/>
      </IconButton>
    </Tooltip>
    {
      isTaskList(list) && <Tooltip title="Add Section">
        <IconButton onClick={openAddSection}>
          <Icons.Section/>
        </IconButton>
      </Tooltip>
    }
    {
      deleteList &&
        <>
          <IconButton {...bindTrigger(actionMenu)}>
            <MenuIcon/>
          </IconButton>
          <Menu
            state={actionMenu}
            anchor={
              {
                vertical: "bottom",
                horizontal: "right",
              }
            }
          >
            <MenuItem onClick={deleteList}>
              <ListItemIcon><Icons.Delete/></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </>
    }
    {taskAddDialogOpen && <TaskDialog list={list} onClosed={closeAddTask}/>}
    {linkAddDialogOpen && <LinkDialog list={list} onClosed={closeAddLink}/>}
    {
      sectionAddDialogOpen && isTaskList(list) &&
      <CreateSectionDialog taskList={list} onClosed={closeAddSection}/>
    }
  </div>;
});
