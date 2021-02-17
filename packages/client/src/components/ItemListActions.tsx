import IconButton from "@material-ui/core/IconButton";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useMemo } from "react";

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
import { useBoolState } from "../utils/hooks";
import type { Section, TaskList } from "../utils/state";
import {
  isSection,
  useUser,
  useProjectRoot,
  isContext,
  isUser,
  isProject,
} from "../utils/state";
import { flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { ViewType, replaceView, useView } from "../utils/view";
import { SectionIcon, DeleteIcon, CheckedIcon } from "./Icons";

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      flex: 1,
      ...flexRow,
      alignItems: "center",
      justifyContent: "end",
    },
  }));

interface ItemListActionsProps {
  list: TaskList | Section;
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
    if (isUser(list)) {
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
      <IconButton onClick={openAddTask}><CheckedIcon/></IconButton>
      {!isSection(list) && <IconButton onClick={openAddSection}><SectionIcon/></IconButton>}
      {deleteList && <IconButton onClick={deleteList}><DeleteIcon/></IconButton>}
    </div>
    {taskAddDialogOpen && <TaskDialog list={list} onClose={closeAddTask}/>}
    {
      sectionAddDialogOpen && !isSection(list) &&
      <CreateSectionDialog taskList={list} onClose={closeAddSection}/>
    }
  </>;
});
