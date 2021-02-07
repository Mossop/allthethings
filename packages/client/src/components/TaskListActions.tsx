import IconButton from "@material-ui/core/IconButton";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useCallback, useMemo, useState } from "react";

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
import { ViewType, replaceView } from "../utils/navigation";
import type { Section, TaskList } from "../utils/state";
import {
  isSection,
  useUser,
  useView,
  useProjectRoot,
  isContext,
  isUser,
  isProject,
} from "../utils/state";
import { flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { SectionIcon, DeleteIcon } from "./Icons";

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      flex: 1,
      ...flexRow,
      alignItems: "center",
      justifyContent: "end",
    },
  }));

interface TaskListActionsProps {
  list: TaskList | Section;
}

export default ReactMemo(function TaskListActions({
  list,
}: TaskListActionsProps): ReactResult {
  let classes = useStyles();
  let root = useProjectRoot();
  let view = useView();
  let user = useUser();

  let [sectionAddDialogOpen, setSectionAddDialogOpen] = useState(false);
  let openAddSection = useCallback(() => {
    setSectionAddDialogOpen(true);
  }, []);
  let closeAddSection = useCallback(() => {
    setSectionAddDialogOpen(false);
  }, []);

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
      {!isSection(list) && <IconButton onClick={openAddSection}><SectionIcon/></IconButton>}
      {deleteList && <IconButton onClick={deleteList}><DeleteIcon/></IconButton>}
    </div>
    {
      sectionAddDialogOpen && !isSection(list) &&
      <CreateSectionDialog taskList={list} onClose={closeAddSection}/>
    }
  </>;
});
