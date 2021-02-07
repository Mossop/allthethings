import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { useCallback, Fragment, useMemo, useState } from "react";
import type { DragSourceMonitor, DropTargetMonitor } from "react-dnd";
import { useDrag } from "react-dnd";

import HiddenInput from "../components/HiddenInput";
import { ProjectIcon, SectionIcon, DeleteIcon } from "../components/Icons";
import { Heading, TextStyles } from "../components/Text";
import {
  useDeleteContextMutation,
  useDeleteProjectMutation,
  useDeleteSectionMutation,
  useEditContextMutation,
  useEditProjectMutation,
  useEditSectionMutation,
  useMoveSectionMutation,
} from "../schema/mutations";
import {
  refetchListContextStateQuery,
  refetchListTaskListQuery,
  useListTaskListQuery,
} from "../schema/queries";
import type { DraggedSection } from "../utils/drag";
import { DragType, useDrop } from "../utils/drag";
import type { TaskListView } from "../utils/navigation";
import { ViewType, replaceView } from "../utils/navigation";
import type { Context, Project, Section, TaskList, User } from "../utils/state";
import {
  useUser,
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
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
    },
    headingDragPreview: {
      ...flexRow,
      alignItems: "center",
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

  return <div className={classes.headingActions}>
    {deleteList && <IconButton onClick={deleteList}><DeleteIcon/></IconButton>}
  </div>;
});

interface SectionListProps {
  section: Section;
  onDragOver: (section: Section, over: Section | null) => void;
}

const SectionList = ReactMemo(function SectionList({
  section,
  onDragOver,
}: SectionListProps): ReactResult {
  let classes = useStyles();

  let hover = useCallback((item: DraggedSection): void => {
    onDragOver(item.section, section);
  }, [onDragOver, section]);

  let [, dropRef] = useDrop({
    accept: DragType.Section,
    canDrop: () => false,
    hover,
  });

  let begin = useCallback((): void => {
    onDragOver(section, null);
  }, [section, onDragOver]);

  let end = useCallback((item: DraggedSection | undefined, monitor: DragSourceMonitor): void => {
    if (!monitor.didDrop()) {
      onDragOver(section, null);
    }
  }, [section, onDragOver]);

  let [{ isDragging }, dragRef, previewRef] = useDrag({
    item: {
      type: DragType.Section,
      section,
    },
    begin,
    end,
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

  return <List
    disablePadding={true}
    className={clsx(classes.section)}
    ref={dropRef}
  >
    <ListSubheader
      disableGutters={true}
      className={clsx(classes.sectionHeading, isDragging && classes.dragging)}
    >
      <div ref={previewRef} className={classes.sectionHeading}>
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
      </div>
      <TaskListActions list={section}/>
    </ListSubheader>
  </List>;
});

interface UserHeaderProps {
  user: User;
}

const UserHeader = ReactMemo(function TasksHeader({
  user,
}: UserHeaderProps): ReactResult {
  let classes = useStyles();

  return <div className={classes.heading}>
    <div className={classes.icon}>
      <ProjectIcon/>
    </div>
    <Heading className={classes.tasksHeading}>Tasks</Heading>
    <TaskListActions list={user}/>
  </div>;
});

interface ContextHeaderProps {
  context: Context;
}

const ContextHeader = ReactMemo(function TasksHeader({
  context,
}: ContextHeaderProps): ReactResult {
  let classes = useStyles();

  let [editContext] = useEditContextMutation();

  let changeContextName = useCallback((name: string) => {
    void editContext({
      variables: {
        id: context.id,
        params: {
          name,
        },
      },
    });
  }, [context.id, editContext]);

  return <div className={classes.heading}>
    <div className={classes.icon}>
      <ProjectIcon/>
    </div>
    <HiddenInput
      className={classes.headingInput}
      initialValue={context.name}
      onSubmit={changeContextName}
    />
    <TaskListActions list={context}/>
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

  return <div className={clsx(classes.heading, isDragging && classes.dragging)}>
    <div className={classes.headingDragPreview} ref={previewRef}>
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
    </div>
    <TaskListActions list={project}/>
  </div>;
});

interface TaskListProps {
  view: TaskListView;
}

interface DraggedSectionState {
  id: string;
  index: number;
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

  let [draggedSectionState, setDraggedSectionState] = useState<DraggedSectionState | null>(null);

  let orderedSections = useMemo(() => {
    if (!draggedSectionState) {
      return sections;
    }

    let { id: sectionId } = draggedSectionState;

    let index = sections.findIndex((section: Section): boolean => section.id == sectionId);
    if (index < 0) {
      return sections;
    }

    let ordered = [...sections];
    ordered.splice(index, 1);
    ordered.splice(draggedSectionState.index, 0, sections[index]);
    return ordered;
  }, [draggedSectionState, sections]);

  let draggedOver = useCallback((section: Section, over: Section | null): void => {
    if (!over) {
      setDraggedSectionState(null);
      return;
    }

    let index = orderedSections.findIndex((section: Section): boolean => section.id == over.id);
    if (index >= 0) {
      setDraggedSectionState({
        id: section.id,
        index,
      });
    } else {
      setDraggedSectionState(null);
    }
  }, [orderedSections]);

  let canDrop = useCallback((): boolean => {
    if (!draggedSectionState || draggedSectionState.index >= sections.length) {
      return false;
    }

    return true;
  }, [sections, draggedSectionState]);

  let [moveSection] = useMoveSectionMutation();

  let drop = useCallback(
    async (item: DraggedSection, monitor: DropTargetMonitor): Promise<void> => {
      if (monitor.didDrop()) {
        return;
      }

      let index = orderedSections.findIndex(
        (section: Section): boolean => section.id == item.section.id,
      );

      if (index < 0) {
        return;
      }

      let beforeSection = index < orderedSections.length - 1
        ? orderedSections[index + 1].id
        : null;

      await moveSection({
        variables: {
          id: item.section.id,
          taskList: view.taskList.id,
          before: beforeSection,
        },
        refetchQueries: [
          refetchListTaskListQuery({
            taskList: view.taskList.id,
          }),
        ],
      });
    },
    [moveSection, view, orderedSections],
  );

  let [, dropRef] = useDrop({
    accept: DragType.Section,
    canDrop,
    drop,
  });

  let header;
  if (isUser(view.taskList)) {
    header = <UserHeader user={view.taskList}/>;
  } else if (isProject(view.taskList)) {
    header = <ProjectHeader project={view.taskList}/>;
  } else {
    header = <ContextHeader context={view.taskList}/>;
  }

  return <div className={classes.outer}>
    <div className={classes.content}>
      {header}
      <List disablePadding={true} ref={dropRef}>
        {
          orderedSections.map((section: Section, index: number) => <Fragment
            key={section.id}
          >
            {index > 0 && <Divider/>}
            <SectionList
              key={section.id}
              section={section}
              onDragOver={draggedOver}
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
