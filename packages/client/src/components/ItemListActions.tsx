import {
  useBoolState,
  Icons,
  Styles,
  ReactMemo,
  Menu,
  useMenuState,
  bindTrigger,
} from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import {
  IconButton,
  createStyles,
  makeStyles,
  Tooltip,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@material-ui/core";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo } from "react";

import {
  useDeleteContextMutation,
  useDeleteProjectMutation,
  useDeleteSectionMutation,
} from "../schema/mutations";
import {
  refetchListContextStateQuery,
  refetchListTaskListQuery,
} from "../schema/queries";
import CreateSectionDialog from "../ui/CreateSectionDialog";
import LinkDialog from "../ui/LinkDialog";
import TaskDialog from "../ui/TaskDialog";
import type { Inbox, Section, TaskList } from "../utils/state";
import {
  isTaskList,
  isInbox,
  useUser,
  useProjectRoot,
  isContext,
  isUser,
  isProject,
} from "../utils/state";
import { ViewType, replaceView, useView, ListFilter } from "../utils/view";

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      flex: 1,
      ...Styles.flexRow,
      alignItems: "center",
      justifyContent: "end",
    },
  }));

interface ItemListActionsProps {
  list: Inbox | TaskList | Section;
  filter: ListFilter;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
}

export default ReactMemo(function ItemListActions({
  list,
  filter,
  setFilter,
}: ItemListActionsProps): ReactResult {
  let classes = useStyles();
  let root = useProjectRoot();
  let view = useView();
  let user = useUser();
  let filterMenuState = useMenuState("filter");

  let [sectionAddDialogOpen, openAddSection, closeAddSection] = useBoolState();
  let [taskAddDialogOpen, openAddTask, closeAddTask] = useBoolState();
  let [linkAddDialogOpen, openAddLink, closeAddLink] = useBoolState();

  let [deleteSection] = useDeleteSectionMutation();
  let [deleteProject] = useDeleteProjectMutation({
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
  });
  let [deleteContext] = useDeleteContextMutation({
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
  });

  let deleteList = useMemo(() => {
    if (isUser(list) || isInbox(list)) {
      return null;
    }

    return () => {
      if (isProject(list)) {
        replaceView({
          type: ViewType.TaskList,
          taskList: list.parent ?? root,
        }, view);

        void deleteProject({
          variables: {
            id: list.id,
          },
        });
      } else if (isContext(list)) {
        replaceView({
          type: ViewType.TaskList,
          taskList: user,
          context: null,
        }, view);

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
          refetchQueries: [
            refetchListTaskListQuery({
              taskList: list.taskList.id,
            }),
          ],
        });
      }
    };
  }, [deleteContext, deleteProject, deleteSection, list, root, view, user]);

  let filterNormal = useCallback(() => setFilter(ListFilter.Normal), [setFilter]);
  let filterComplete = useCallback(() => setFilter(ListFilter.Complete), [setFilter]);
  let filterIncomplete = useCallback(() => setFilter(ListFilter.Incomplete), [setFilter]);
  let filterArchived = useCallback(() => setFilter(ListFilter.Archived), [setFilter]);
  let filterSnoozed = useCallback(() => setFilter(ListFilter.Snoozed), [setFilter]);

  let badge;
  switch (filter) {
    case ListFilter.Normal:
      badge = null;
      break;
    case ListFilter.Incomplete:
      badge = <Icons.Unchecked/>;
      break;
    case ListFilter.Complete:
      badge = <Icons.Checked/>;
      break;
    case ListFilter.Archived:
      badge = <Icons.Archive/>;
      break;
    case ListFilter.Snoozed:
      badge = <Icons.Snooze/>;
      break;
  }

  return <>
    <div className={classes.actions}>
      <Tooltip title="Add task">
        <IconButton onClick={openAddTask}><Icons.Checked/></IconButton>
      </Tooltip>
      <Tooltip title="Add link">
        <IconButton onClick={openAddLink}><Icons.Link/></IconButton>
      </Tooltip>
      {
        isTaskList(list) &&
        <Tooltip title="Add section">
          <IconButton onClick={openAddSection}><Icons.Section/></IconButton>
        </Tooltip>
      }
      {
        (isTaskList(list) || isInbox(list)) &&
        <>
          <Tooltip title="Filter">
            <IconButton {...bindTrigger(filterMenuState)}>
              {
                badge
                  ? <Badge badgeContent={badge} color="primary">
                    <Icons.Filter/>
                  </Badge>
                  : <Icons.Filter/>
              }
            </IconButton>
          </Tooltip>
          <Menu
            state={filterMenuState}
            anchor={
              {
                vertical: "bottom",
                horizontal: "right",
              }
            }
          >
            <MenuItem selected={filter == ListFilter.Normal} onClick={filterNormal}>
              <ListItemIcon>
                <Icons.Section/>
              </ListItemIcon>
              <ListItemText>Current Items</ListItemText>
            </MenuItem>
            <MenuItem selected={filter == ListFilter.Incomplete} onClick={filterIncomplete}>
              <ListItemIcon>
                <Icons.Unchecked/>
              </ListItemIcon>
              <ListItemText>Incomplete Tasks</ListItemText>
            </MenuItem>
            <MenuItem selected={filter == ListFilter.Complete} onClick={filterComplete}>
              <ListItemIcon>
                <Icons.Checked/>
              </ListItemIcon>
              <ListItemText>Complete Tasks</ListItemText>
            </MenuItem>
            <MenuItem selected={filter == ListFilter.Archived} onClick={filterArchived}>
              <ListItemIcon>
                <Icons.Archive/>
              </ListItemIcon>
              <ListItemText>Archived Items</ListItemText>
            </MenuItem>
            <MenuItem selected={filter == ListFilter.Snoozed} onClick={filterSnoozed}>
              <ListItemIcon>
                <Icons.Snooze/>
              </ListItemIcon>
              <ListItemText>Snoozed Items</ListItemText>
            </MenuItem>
          </Menu>
        </>
      }
      {
        deleteList &&
        <Tooltip title="Delete">
          <IconButton onClick={deleteList}><Icons.Delete/></IconButton>
        </Tooltip>
      }
    </div>
    {taskAddDialogOpen && <TaskDialog list={list} onClosed={closeAddTask}/>}
    {linkAddDialogOpen && <LinkDialog list={list} onClosed={closeAddLink}/>}
    {
      sectionAddDialogOpen && isTaskList(list) &&
      <CreateSectionDialog taskList={list} onClosed={closeAddSection}/>
    }
  </>;
});
