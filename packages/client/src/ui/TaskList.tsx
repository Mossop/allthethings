import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { useCallback, Fragment, useMemo } from "react";
import type { DragSourceMonitor } from "react-dnd";
import { useDrag } from "react-dnd";

import HiddenInput from "../components/HiddenInput";
import { ProjectIcon, SectionIcon, DeleteIcon } from "../components/Icons";
import { Heading, TextStyles } from "../components/Text";
import {
  useDeleteContextMutation,
  useDeleteProjectMutation,
  useDeleteSectionMutation,
  useEditProjectMutation,
  useEditSectionMutation,
} from "../schema/mutations";
import {
  refetchListContextStateQuery,
  refetchListTaskListQuery,
  useListTaskListQuery,
} from "../schema/queries";
import { DragType } from "../utils/drag";
import type { TaskListView } from "../utils/navigation";
import { ViewType, replaceView } from "../utils/navigation";
import type { Context, Project, Section, TaskList, User } from "../utils/state";
import {
  useView,
  useProjectRoot,
  isContext,
  isUser,
  buildSections,
  isProject,
} from "../utils/state";
import { flexRow, pageStyles, dragging, flexCentered } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import AddDial from "./AddDial";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      ...flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    dragging,
    outer: {
      flex: 1,
      position: "relative",
    },
    content: {
      ...pageStyles(theme),
      height: "100%",
      width: "100%",
    },
    heading: {
      ...flexRow,
      alignItems: "center",
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
    },
    tasksHeading: {
      padding: theme.spacing(1) + 2,
    },
    headingInput: TextStyles.heading,
    section: {
      paddingLeft: theme.spacing(2),
    },
    sectionHeading: {
      ...flexRow,
      alignItems: "center",
      color: theme.palette.text.primary,
    },
    sectionHeadingInput: TextStyles.subheading,
    headingActions: {
      flex: 1,
      ...flexRow,
      alignItems: "center",
      justifyContent: "end",
    },
    floatingAction: {
      position: "absolute",
      bottom: theme.spacing(4),
      right: theme.spacing(4),
    },
  }));

interface TaskListActionsProps {
  list: TaskList | Section;
}

const TaskListActions = ReactMemo(function TaskListActions({
  list,
}: TaskListActionsProps): ReactResult {
  let classes = useStyles();
  let root = useProjectRoot();
  let view = useView();

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
  }, [deleteContext, deleteProject, deleteSection, list, root, view]);

  return <div className={classes.headingActions}>
    {deleteList && <IconButton onClick={deleteList}><DeleteIcon/></IconButton>}
  </div>;
});

interface SectionListProps {
  section: Section;
}

const SectionList = ReactMemo(function SectionList({
  section,
}: SectionListProps): ReactResult {
  let classes = useStyles();

  let [{ isDragging }, dragRef, previewRef] = useDrag({
    item: {
      type: DragType.Section,
      section,
    },
    collect: (monitor: DragSourceMonitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });

  let [editSection] = useEditSectionMutation();

  let changeSectionName = useCallback((name: string): void => {
    void editSection({
      variables: {
        id: section.id,
        params: {
          name,
        },
      },
    });
  }, [section, editSection]);

  return <List className={classes.section}>
    <ListSubheader
      ref={previewRef}
      disableGutters={true}
      className={clsx(classes.sectionHeading, isDragging && classes.dragging)}
    >
      <div
        className={classes.icon}
        ref={dragRef}
      >
        <SectionIcon className={classes.dragHandle}/>
      </div>
      <HiddenInput
        className={classes.sectionHeadingInput}
        initialValue={section.name}
        onSubmit={changeSectionName}
      />
      <TaskListActions list={section}/>
    </ListSubheader>
  </List>;
});

interface TasksHeaderProps {
  root: User | Context;
}

const TasksHeader = ReactMemo(function TasksHeader({
  root,
}: TasksHeaderProps): ReactResult {
  let classes = useStyles();

  return <div className={classes.heading}>
    <div className={classes.icon}>
      <ProjectIcon/>
    </div>
    <Heading className={classes.tasksHeading}>Tasks</Heading>
    <TaskListActions list={root}/>
  </div>;
});

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader = ReactMemo(function ProjectHeader({
  project,
}: ProjectHeaderProps): ReactResult {
  let classes = useStyles();
  let [editProject] = useEditProjectMutation();

  let changeTaskListName = useCallback((name: string): void => {
    void editProject({
      variables: {
        id: project.id,
        params: {
          name,
        },
      },
    });
  }, [editProject, project]);

  let [{ isDragging }, dragRef, previewRef] = useDrag({
    item: {
      type: DragType.Project,
      project,
    },
    collect: (monitor: DragSourceMonitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });

  return <div
    ref={previewRef}
    className={clsx(classes.heading, isDragging && classes.dragging)}
  >
    <div
      className={classes.icon}
      ref={dragRef}
    >
      <ProjectIcon className={classes.dragHandle}/>
    </div>
    <HiddenInput
      className={classes.headingInput}
      initialValue={project.name}
      onSubmit={changeTaskListName}
    />
    <TaskListActions list={project}/>
  </div>;
});

interface TaskListProps {
  view: TaskListView;
}

export default ReactMemo(function TaskList({
  view,
}: TaskListProps): ReactResult {
  let classes = useStyles();
  let { data } = useListTaskListQuery({
    variables: {
      taskList: view.taskList.id,
    },
  });

  let sections = useMemo(
    () => data?.taskList ? buildSections(view.taskList, data.taskList.sections) : [],
    [data, view],
  );

  return <div className={classes.outer}>
    <div className={classes.content}>
      {
        isProject(view.taskList)
          ? <ProjectHeader project={view.taskList}/>
          : <TasksHeader root={view.taskList}/>
      }
      <List>
        {
          sections.map((section: Section) => <Fragment
            key={section.id}
          >
            <Divider/>
            <SectionList
              key={section.id}
              section={section}
            />
          </Fragment>)
        }
      </List>
    </div>
    <div className={classes.floatingAction}>
      <AddDial viewType={view.type} taskList={view.taskList}/>
    </div>
  </div>;
});
