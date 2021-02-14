import List from "@material-ui/core/List";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { forwardRef, useCallback, useMemo } from "react";
import type { DragSourceMonitor } from "react-dnd";
import { useDrag } from "react-dnd";

import HiddenInput from "../components/HiddenInput";
import { ProjectIcon } from "../components/Icons";
import ItemDisplay from "../components/Item";
import ItemListActions from "../components/ItemListActions";
import SectionList from "../components/SectionList";
import { Heading, TextStyles } from "../components/Text";
import {
  useEditContextMutation,
  useEditProjectMutation,
  useMoveProjectMutation,
} from "../schema/mutations";
import { refetchListContextStateQuery, useListTaskListQuery } from "../schema/queries";
import type { DraggedProject, ProjectDragTarget } from "../utils/drag";
import { useTaskListDragManager, DragType } from "../utils/drag";
import type {
  Context,
  Item,
  Project,
  Section,
  User,
} from "../utils/state";
import { isUser, buildEntries, isProject } from "../utils/state";
import { flexRow, pageStyles, flexCentered } from "../utils/styles";
import type { ReactRef, ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import type { TaskListView } from "../utils/view";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      ...flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    dragging: {
      display: "none",
    },
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
      marginBottom: theme.spacing(1),
    },
    headingDragPreview: {
      ...flexRow,
      alignItems: "center",
    },
    tasksHeading: {
      padding: theme.spacing(1) + 2,
    },
    headingInput: TextStyles.heading,
  }));

interface UserHeaderProps {
  user: User;
}

const UserHeader = ReactMemo(forwardRef(function TasksHeader({
  user,
}: UserHeaderProps, ref: ReactRef | null): ReactResult {
  let classes = useStyles();

  return <div ref={ref} className={classes.heading}>
    <div className={classes.icon}>
      <ProjectIcon/>
    </div>
    <Heading className={classes.tasksHeading}>Tasks</Heading>
    <ItemListActions list={user}/>
  </div>;
}));

interface ContextHeaderProps {
  context: Context;
}

const ContextHeader = ReactMemo(forwardRef(function TasksHeader({
  context,
}: ContextHeaderProps, ref: ReactRef | null): ReactResult {
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

  return <div ref={ref} className={classes.heading}>
    <div className={classes.icon}>
      <ProjectIcon/>
    </div>
    <HiddenInput
      className={classes.headingInput}
      initialValue={context.name}
      onSubmit={changeContextName}
    />
    <ItemListActions list={context}/>
  </div>;
}));

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader = ReactMemo(forwardRef(function ProjectHeader({
  project,
}: ProjectHeaderProps, ref: ReactRef | null): ReactResult {
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

  let [moveProject] = useMoveProjectMutation({
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
  });

  let [{ isDragging }, dragRef, previewRef] = useDrag({
    item: useMemo<DraggedProject>(() => ({
      type: DragType.Project,
      item: project,
    }), [project]),

    end: useCallback(
      async (item: unknown, monitor: DragSourceMonitor): Promise<void> => {
        if (monitor.didDrop()) {
          let target: ProjectDragTarget | null = monitor.getDropResult();
          if (target) {
            await moveProject({
              variables: {
                id: project.id,
                taskList: target.taskList.id,
              },
            });
          }
        }
      },
      [moveProject, project.id],
    ),

    collect: useCallback(
      (monitor: DragSourceMonitor) => {
        return {
          isDragging: monitor.isDragging(),
        };
      },
      [],
    ),
  });

  return <div ref={ref} className={clsx(classes.heading, isDragging && classes.dragging)}>
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
    <ItemListActions list={project}/>
  </div>;
}));

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

  let entries = useMemo(
    () => buildEntries(view.taskList, data),
    [data, view],
  );

  let {
    dragState,
    onDragOver,
    dropRef,
    headerDropRef,
  } = useTaskListDragManager(view.taskList, entries);

  let header: ReactResult;
  if (isUser(view.taskList)) {
    header = <UserHeader ref={headerDropRef} user={view.taskList}/>;
  } else if (isProject(view.taskList)) {
    header = <ProjectHeader ref={headerDropRef} project={view.taskList}/>;
  } else {
    header = <ContextHeader ref={headerDropRef} context={view.taskList}/>;
  }

  let sections = entries.sections.map((section: Section) => <SectionList
    key={section.id}
    section={section}
    dragState={dragState}
    onDragOver={onDragOver}
  />);
  if (dragState && dragState.type == DragType.Section) {
    sections.splice(dragState.index, 0, <SectionList
      key="dragging"
      section={dragState.item}
      dragState={dragState}
      onDragOver={onDragOver}
    />);
  }

  let items = entries.items.map((item: Item) => <ItemDisplay
    key={item.id}
    taskList={view.taskList}
    section={null}
    item={item}
    dragState={dragState}
    onDragOver={onDragOver}
  />);
  if (dragState && dragState.type == DragType.Item && !dragState.section) {
    items.splice(dragState.index, 0, <ItemDisplay
      key="dragging"
      taskList={view.taskList}
      section={null}
      item={dragState.item}
      dragState={dragState}
      onDragOver={onDragOver}
    />);
  }

  return <div className={classes.outer}>
    <div className={classes.content} ref={dropRef}>
      {header}
      <List disablePadding={true}>
        {items}
        {sections}
      </List>
    </div>
  </div>;
});
