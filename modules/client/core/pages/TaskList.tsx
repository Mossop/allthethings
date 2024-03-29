import { List } from "@mui/material";
import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import type { Dispatch, SetStateAction } from "react";
import { useState, forwardRef, useCallback } from "react";

import type { ReactRef, ReactResult } from "../../utils";
import { Icons, Styles, TextStyles, HiddenInput, ReactMemo } from "../../utils";
import FilterMenu from "../components/FilterMenu";
import ItemListActions from "../components/ItemListActions";
import Page from "../components/Page";
import SectionList, { ItemList } from "../components/SectionList";
import type { Context, Project, Section } from "../schema";
import { isProject, useTaskListContents } from "../schema";
import { useEditContextMutation, useEditProjectMutation } from "../utils/api";
import { useDragSource } from "../utils/drag";
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
      padding: `calc(${theme.spacing(1)} + 2px)`,
      whiteSpace: "nowrap",
    },
    headingInput: {
      ...TextStyles.heading,
      whiteSpace: "nowrap",
    },
    dragging: Styles.dragging,
  }),
);

interface ContextHeaderProps {
  context: Context;
  filter: ListFilter;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
}

const ContextHeader = ReactMemo(
  forwardRef(function TasksHeader(
    { context, filter, setFilter }: ContextHeaderProps,
    ref: ReactRef | null,
  ): ReactResult {
    let classes = useStyles();

    let [editContext] = useEditContextMutation();

    let changeContextName = useCallback(
      (name: string) => {
        void editContext({
          id: context.id,
          params: {
            name,
          },
        });
      },
      [context.id, editContext],
    );

    return (
      <div ref={ref} className={classes.heading}>
        <div className={classes.icon}>
          <Icons.Project />
        </div>
        <HiddenInput
          className={classes.headingInput}
          initialValue={context.name}
          onSubmit={changeContextName}
        />
        <FilterMenu list={context} filter={filter} setFilter={setFilter} />
        <ItemListActions list={context} />
      </div>
    );
  }),
);

interface ProjectHeaderProps {
  project: Project;
  filter: ListFilter;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
}

const ProjectHeader = ReactMemo(
  forwardRef(function ProjectHeader(
    { project, filter, setFilter }: ProjectHeaderProps,
    ref: ReactRef | null,
  ): ReactResult {
    let classes = useStyles();
    let [editProject] = useEditProjectMutation();

    let changeTaskListName = useCallback(
      (name: string): void => {
        void editProject({
          id: project.id,
          params: {
            name,
          },
        });
      },
      [editProject, project],
    );

    let { isDragging, dragRef, previewRef } = useDragSource(project);

    return (
      <div ref={ref} className={clsx(classes.heading)}>
        <div
          className={clsx(
            classes.headingDragPreview,
            isDragging && classes.dragging,
          )}
          ref={previewRef}
        >
          <div className={classes.icon} ref={dragRef}>
            <Icons.Project className={classes.dragHandle} />
          </div>
          <HiddenInput
            className={classes.headingInput}
            initialValue={project.name}
            onSubmit={changeTaskListName}
          />
          <FilterMenu list={project} filter={filter} setFilter={setFilter} />
        </div>
        <ItemListActions list={project} />
      </div>
    );
  }),
);

interface TaskListProps {
  view: TaskListState;
}

export default ReactMemo(function TaskList({
  view,
}: TaskListProps): ReactResult {
  let classes = useStyles();
  let contents = useTaskListContents(view.taskList);
  let [filter, setFilter] = useState(() => Filters.Normal);

  let header: ReactResult;
  if (isProject(view.taskList)) {
    header = (
      <ProjectHeader
        project={view.taskList}
        filter={filter}
        setFilter={setFilter}
      />
    );
  } else {
    header = (
      <ContextHeader
        context={view.taskList}
        filter={filter}
        setFilter={setFilter}
      />
    );
  }

  return (
    <Page>
      <div className={classes.content}>
        {header}
        <List disablePadding={true}>
          <List disablePadding={true}>
            <ItemList items={contents.items} filter={filter} />
          </List>
          <List disablePadding={true}>
            {contents.sections.map((section: Section) => (
              <SectionList key={section.id} section={section} filter={filter} />
            ))}
          </List>
        </List>
      </div>
    </Page>
  );
});
