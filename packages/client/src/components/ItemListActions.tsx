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
  isContext,
  isInbox,
  isProject,
  useDeleteContextMutation,
  useDeleteProjectMutation,
  useDeleteSectionMutation,
  refetchListContextStateQuery,
  refetchQueriesForSection,
} from "../schema";
import type { Inbox, TaskList, Section } from "../schema";
import { ViewType, replaceView, useLoggedInView, useUser } from "../utils/view";
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
  let view = useLoggedInView();
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
    if (isContext(list) && list === user.defaultContext || isInbox(list)) {
      return null;
    }

    return () => {
      if (isProject(list)) {
        replaceView({
          type: ViewType.TaskList,
          taskList: list.parent ?? view.context,
        }, view);

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
          refetchQueries: refetchQueriesForSection(list.taskList),
        });
      }
    };
  }, [deleteContext, deleteProject, deleteSection, list, view, user]);

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
