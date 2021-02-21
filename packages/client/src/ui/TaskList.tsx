import { List,  createStyles, makeStyles  } from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import clsx from "clsx";
import type { ReactElement } from "react";
import { forwardRef, useCallback, useMemo } from "react";

import HiddenInput from "../components/HiddenInput";
import { ProjectIcon } from "../components/Icons";
import ItemListActions from "../components/ItemListActions";
import SectionList, { SectionDragMarker, ItemList } from "../components/SectionList";
import { Heading, TextStyles } from "../components/Text";
import {
  useEditContextMutation,
  useEditProjectMutation,
} from "../schema/mutations";
import { useListTaskListQuery } from "../schema/queries";
import { indexOf, item } from "../utils/collections";
import type { DraggedItem, DraggedSection, ItemDragResult, SectionDragResult } from "../utils/drag";
import { useDragItem, useDragResult, DragType, useDropArea, useProjectDrag } from "../utils/drag";
import type {
  Context,
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
    content: {
      ...pageStyles(theme),
      flex: 1,
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

  let {
    dragRef,
    previewRef,
  } = useProjectDrag(project);

  return <div ref={ref} className={clsx(classes.heading)}>
    <div className={classes.headingDragPreview} ref={previewRef}>
      <div ref={dragRef} className={classes.icon}>
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
    dropRef: headingDropRef,
  } = useDropArea([DragType.Section, DragType.Item], {
    getDragResult: useCallback(
      (draggedItem: DraggedSection | DraggedItem): SectionDragResult | ItemDragResult | null => {
        if (draggedItem.type == DragType.Item) {
          if (draggedItem.item === entries.items[0]) {
            return null;
          }

          return {
            type: DragType.Item,
            target: view.taskList,
            before: item(entries.items, 0),
          };
        }

        if (draggedItem.item === entries.sections[0]) {
          return null;
        }

        return {
          type: DragType.Section,
          taskList: view.taskList,
          before: entries.sections.length ? entries.sections[0] : null,
        };
      },
      [entries, view.taskList],
    ),
  });

  let {
    dropRef: itemsDropRef,
  } = useDropArea(DragType.Section, {
    getDragResult: useCallback(
      (item: DraggedSection): SectionDragResult | null => {
        if (item.item === entries.sections[0]) {
          return null;
        }

        return {
          type: DragType.Section,
          taskList: view.taskList,
          before: entries.sections.length ? entries.sections[0] : null,
        };
      },
      [entries.sections, view.taskList],
    ),
  });

  let dragItem = useDragItem(DragType.Section);
  let dragResult = useDragResult(DragType.Section);

  let header: ReactResult;
  if (isUser(view.taskList)) {
    header = <UserHeader ref={headingDropRef} user={view.taskList}/>;
  } else if (isProject(view.taskList)) {
    header = <ProjectHeader ref={headingDropRef} project={view.taskList}/>;
  } else {
    header = <ContextHeader ref={headingDropRef} context={view.taskList}/>;
  }

  let sections = useMemo(() => {
    let sections = entries.sections.map(
      (section: Section, index: number): ReactElement => <SectionList
        key={section.id}
        section={section}
        index={index}
        sections={entries.sections}
      />,
    );

    if (dragItem && (!dragResult || dragResult.taskList === view.taskList)) {
      let before = dragResult ? dragResult.before : dragItem.item;
      let index = before ? indexOf(entries.sections, before) ?? sections.length : sections.length;
      sections.splice(index, 0, <SectionDragMarker
        key="dragging"
        section={dragItem.item}
      />);
    }

    return sections;
  }, [dragItem, dragResult, entries.sections, view.taskList]);

  return <div className={classes.content}>
    {header}
    <List disablePadding={true}>
      <List disablePadding={true} ref={itemsDropRef}>
        <ItemList items={entries.items} taskList={view.taskList} section={null}/>
      </List>
      <List disablePadding={true}>
        {sections}
      </List>
    </List>
  </div>;
});
