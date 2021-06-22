import { Icons, Styles, Heading, TextStyles, HiddenInput, ReactMemo } from "@allthethings/ui";
import type { ReactRef, ReactResult } from "@allthethings/ui";
import { List, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import clsx from "clsx";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import { useState, forwardRef, useCallback, useMemo } from "react";

import FilterMenu from "../components/FilterMenu";
import ItemListActions from "../components/ItemListActions";
import Page from "../components/Page";
import SectionList, { SectionDragMarker, ItemList } from "../components/SectionList";
import type { Context, Project, User, Section } from "../schema";
import {
  isProject,
  isUser,
  useEditContextMutation,
  useEditProjectMutation,
  useTaskListContents,
} from "../schema";
import { indexOf, item } from "../utils/collections";
import type { DraggedItem, DraggedSection, ItemDragResult, SectionDragResult } from "../utils/drag";
import { useDragItem, useDragResult, DragType, useDropArea, useProjectDrag } from "../utils/drag";
import type { ListFilter } from "../utils/filter";
import { Filters } from "../utils/filter";
import type { TaskListState } from "../utils/view";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      ...Styles.flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    dragging: {
      display: "none",
    },
    content: {
      ...Styles.pageStyles(theme),
      flex: 1,
    },
    heading: {
      ...Styles.flexCenteredRow,
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
    },
    headingDragPreview: {
      ...Styles.flexCenteredRow,
    },
    tasksHeading: {
      padding: theme.spacing(1) + 2,
      whiteSpace: "nowrap",
    },
    headingInput: TextStyles.heading,
  }));

interface UserHeaderProps {
  user: User;
  filter: ListFilter;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
}

const UserHeader = ReactMemo(forwardRef(function TasksHeader({
  user,
  filter,
  setFilter,
}: UserHeaderProps, ref: ReactRef | null): ReactResult {
  let classes = useStyles();

  return <div ref={ref} className={classes.heading}>
    <div className={classes.icon}>
      <Icons.Project/>
    </div>
    <Heading className={classes.tasksHeading}>Tasks</Heading>
    <FilterMenu list={user} filter={filter} setFilter={setFilter}/>
    <ItemListActions list={user}/>
  </div>;
}));

interface ContextHeaderProps {
  context: Context;
  filter: ListFilter;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
}

const ContextHeader = ReactMemo(forwardRef(function TasksHeader({
  context,
  filter,
  setFilter,
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
      <Icons.Project/>
    </div>
    <HiddenInput
      className={classes.headingInput}
      initialValue={context.name}
      onSubmit={changeContextName}
    />
    <FilterMenu list={context} filter={filter} setFilter={setFilter}/>
    <ItemListActions list={context}/>
  </div>;
}));

interface ProjectHeaderProps {
  project: Project;
  filter: ListFilter;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
}

const ProjectHeader = ReactMemo(forwardRef(function ProjectHeader({
  project,
  filter,
  setFilter,
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
        <Icons.Project className={classes.dragHandle}/>
      </div>
      <HiddenInput
        className={classes.headingInput}
        initialValue={project.name}
        onSubmit={changeTaskListName}
      />
      <FilterMenu list={project} filter={filter} setFilter={setFilter}/>
    </div>
    <ItemListActions list={project}/>
  </div>;
}));

interface TaskListProps {
  view: TaskListState;
}

export default ReactMemo(function TaskList({
  view,
}: TaskListProps): ReactResult {
  let classes = useStyles();
  let contents = useTaskListContents(view.taskList);
  let [filter, setFilter] = useState(() => Filters.Normal);

  let {
    dropRef: headingDropRef,
  } = useDropArea([DragType.Section, DragType.Item], {
    getDragResult: useCallback(
      (draggedItem: DraggedSection | DraggedItem): SectionDragResult | ItemDragResult | null => {
        if (draggedItem.type == DragType.Item) {
          if (draggedItem.item === contents.items[0]) {
            return null;
          }

          return {
            type: DragType.Item,
            target: view.taskList,
            before: item(contents.items, 0),
          };
        }

        if (draggedItem.item === contents.sections[0]) {
          return null;
        }

        return {
          type: DragType.Section,
          taskList: view.taskList,
          before: contents.sections.length ? contents.sections[0] : null,
        };
      },
      [contents, view.taskList],
    ),
  });

  let {
    dropRef: itemsDropRef,
  } = useDropArea(DragType.Section, {
    getDragResult: useCallback(
      (item: DraggedSection): SectionDragResult | null => {
        if (item.item === contents.sections[0]) {
          return null;
        }

        return {
          type: DragType.Section,
          taskList: view.taskList,
          before: contents.sections.length ? contents.sections[0] : null,
        };
      },
      [contents.sections, view.taskList],
    ),
  });

  let dragItem = useDragItem(DragType.Section);
  let dragResult = useDragResult(DragType.Section);

  let header: ReactResult;
  if (isUser(view.taskList)) {
    header = <UserHeader
      ref={headingDropRef}
      user={view.taskList}
      filter={filter}
      setFilter={setFilter}
    />;
  } else if (isProject(view.taskList)) {
    header = <ProjectHeader
      ref={headingDropRef}
      project={view.taskList}
      filter={filter}
      setFilter={setFilter}
    />;
  } else {
    header = <ContextHeader
      ref={headingDropRef}
      context={view.taskList}
      filter={filter}
      setFilter={setFilter}
    />;
  }

  let sections = useMemo(() => {
    let sections = contents.sections.map(
      (section: Section, index: number): ReactElement => <SectionList
        key={section.id}
        section={section}
        index={index}
        sections={contents.sections}
        filter={filter}
      />,
    );

    if (dragItem && (!dragResult || dragResult.taskList === view.taskList)) {
      let before = dragResult ? dragResult.before : dragItem.item;
      let index = before ? indexOf(contents.sections, before) ?? sections.length : sections.length;
      sections.splice(index, 0, <SectionDragMarker
        key="dragging"
        section={dragItem.item}
      />);
    }

    return sections;
  }, [dragItem, dragResult, contents.sections, view.taskList, filter]);

  return <Page>
    <div className={classes.content}>
      {header}
      <List disablePadding={true}>
        <List disablePadding={true} ref={itemsDropRef}>
          <ItemList items={contents.items} section={view.taskList} filter={filter}/>
        </List>
        <List disablePadding={true}>
          {sections}
        </List>
      </List>
    </div>
  </Page>;
});
