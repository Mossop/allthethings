import {
  Icons,
  Styles,
  ReactMemo,
} from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import {
  IconButton,
  createStyles,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
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
import type { Inbox, Section, TaskList } from "../utils/state";
import {
  isInbox,
  useUser,
  useProjectRoot,
  isContext,
  isUser,
  isProject,
} from "../utils/state";
import { ViewType, replaceView, useView } from "../utils/view";
import AddMenu from "./AddMenu";

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
  let root = useProjectRoot();
  let view = useView();
  let user = useUser();

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

  return <div className={classes.actions}>
    <AddMenu list={list}/>
    {
      deleteList &&
        <Tooltip title="Delete">
          <IconButton onClick={deleteList}><Icons.Delete/></IconButton>
        </Tooltip>
    }
  </div>;
});
