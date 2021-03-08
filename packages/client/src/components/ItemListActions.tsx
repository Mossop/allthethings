import { IconButton, createStyles, makeStyles } from "@material-ui/core";
import { useMemo } from "react";

import { useBoolState, Icons, Styles, ReactMemo } from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";

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
import { ViewType, replaceView, useView } from "../utils/view";

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
}

export default ReactMemo(function ItemListActions({
  list,
}: ItemListActionsProps): ReactResult {
  let classes = useStyles();
  let root = useProjectRoot();
  let view = useView();
  let user = useUser();

  let [sectionAddDialogOpen, openAddSection, closeAddSection] = useBoolState();
  let [taskAddDialogOpen, openAddTask, closeAddTask] = useBoolState();

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

  return <>
    <div className={classes.actions}>
      <IconButton onClick={openAddTask}><Icons.CheckedIcon/></IconButton>
      {isTaskList(list) && <IconButton onClick={openAddSection}><Icons.SectionIcon/></IconButton>}
      {deleteList && <IconButton onClick={deleteList}><Icons.DeleteIcon/></IconButton>}
    </div>
    {taskAddDialogOpen && <TaskDialog list={list} onClose={closeAddTask}/>}
    {
      sectionAddDialogOpen && isTaskList(list) &&
      <CreateSectionDialog taskList={list} onClose={closeAddSection}/>
    }
  </>;
});
