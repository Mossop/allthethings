import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import type { DragSourceMonitor, DropTargetMonitor } from "react-dnd";
import { useDrag } from "react-dnd";

import HiddenInput from "../components/HiddenInput";
import { ProjectIcon, SectionIcon } from "../components/Icons";
import ItemListActions from "../components/ItemListActions";
import Items from "../components/Items";
import { Heading, TextStyles } from "../components/Text";
import {
  useEditContextMutation,
  useEditProjectMutation,
  useEditSectionMutation,
  useMoveSectionMutation,
} from "../schema/mutations";
import { refetchListTaskListQuery, useListTaskListQuery } from "../schema/queries";
import type { DraggedSection } from "../utils/drag";
import { DragType, useDrop } from "../utils/drag";
import type { TaskListView } from "../utils/navigation";
import type { Context, Project, Section, User } from "../utils/state";
import { isUser, buildEntries, isProject } from "../utils/state";
import { flexRow, pageStyles, dragging, flexCentered } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

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
    section: {
      paddingLeft: theme.spacing(2),
    },
    sectionHeading: {
      ...flexRow,
      alignItems: "center",
      color: theme.palette.text.primary,
      paddingBottom: theme.spacing(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
      paddingTop: theme.spacing(1),
      borderTopWidth: 1,
      borderTopColor: theme.palette.divider,
      borderTopStyle: "solid",
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    sectionDragPreview: {
      ...flexRow,
      alignItems: "center",
    },
    sectionHeadingInput: TextStyles.subheading,
  }));

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
      <div ref={previewRef} className={classes.sectionDragPreview}>
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
      <ItemListActions list={section}/>
    </ListSubheader>
    <Items items={section.items} section={section} taskList={section.taskList}/>
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
    <ItemListActions list={user}/>
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
    <ItemListActions list={context}/>
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
    <ItemListActions list={project}/>
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

  let entries = useMemo(
    () => buildEntries(view.taskList, data),
    [data, view],
  );

  let [draggedSectionState, setDraggedSectionState] = useState<DraggedSectionState | null>(null);

  let orderedSections = useMemo(() => {
    if (!draggedSectionState) {
      return entries.sections;
    }

    let { id: sectionId } = draggedSectionState;

    let index = entries.sections.findIndex((section: Section): boolean => section.id == sectionId);
    if (index < 0) {
      return entries.sections;
    }

    let ordered = [...entries.sections];
    ordered.splice(index, 1);
    ordered.splice(draggedSectionState.index, 0, entries.sections[index]);
    return ordered;
  }, [draggedSectionState, entries]);

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
    if (!draggedSectionState || draggedSectionState.index >= orderedSections.length) {
      return false;
    }

    return true;
  }, [orderedSections, draggedSectionState]);

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
        <Items items={entries.items} section={null} taskList={view.taskList}/>
        {
          orderedSections.map((section: Section) => <SectionList
            key={section.id}
            section={section}
            onDragOver={draggedOver}
          />)
        }
      </List>
    </div>
  </div>;
});
