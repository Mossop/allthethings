import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { useCallback, Fragment, useMemo } from "react";
import type { DragSourceMonitor } from "react-dnd";
import { useDrag } from "react-dnd";

import HiddenInput from "../components/HiddenInput";
import { ProjectIcon, SectionIcon } from "../components/Icons";
import { TextStyles } from "../components/Text";
import { useEditProjectMutation, useEditSectionMutation } from "../schema/mutations";
import { useListTaskListQuery } from "../schema/queries";
import { DragType } from "../utils/drag";
import type { TaskListView } from "../utils/navigation";
import type { Project, Section } from "../utils/state";
import { buildItems, buildSections, isProject } from "../utils/state";
import { flexRow, pageStyles, dragging, flexCentered } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import AddDial from "./AddDial";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dragContainer: {
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
      paddingBottom: theme.spacing(2),
    },
    headingInput: TextStyles.heading,
    sectionHeading: {
      ...flexRow,
      alignItems: "center",
      color: theme.palette.text.primary,
    },
    sectionHeadingInput: TextStyles.subheading,
    floatingAction: {
      position: "absolute",
      bottom: theme.spacing(4),
      right: theme.spacing(4),
    },
  }));

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

  return <List>
    <ListSubheader
      ref={previewRef}
      className={clsx(classes.sectionHeading, isDragging && classes.dragging)}
    >
      <div
        className={classes.dragContainer}
        ref={dragRef}
      >
        <SectionIcon className={classes.dragHandle}/>
      </div>
      <HiddenInput
        className={classes.sectionHeadingInput}
        initialValue={section.name}
        onSubmit={changeSectionName}
      />
    </ListSubheader>
  </List>;
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
      className={classes.dragContainer}
      ref={dragRef}
    >
      <ProjectIcon className={classes.dragHandle}/>
    </div>
    <HiddenInput
      className={classes.headingInput}
      initialValue={project.name}
      onSubmit={changeTaskListName}
    />
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

  let items = useMemo(
    () => data?.taskList ? buildItems(data.taskList.items) : [],
    [data],
  );
  let sections = useMemo(
    () => data?.taskList ? buildSections(view.taskList, data.taskList.sections) : [],
    [data, view],
  );

  let shouldShowDivider = useCallback((index: number): boolean => {
    if (index > 0) {
      return true;
    }

    if (isProject(view.taskList)) {
      return true;
    }

    if (items.length > 0) {
      return true;
    }

    return false;
  }, [view, items]);

  return <div className={classes.outer}>
    <div className={classes.content}>
      {
        isProject(view.taskList) && <ProjectHeader project={view.taskList}/>
      }
      <List>
        {
          sections.map((section: Section, index: number) => <Fragment
            key={section.id}
          >
            {shouldShowDivider(index) && <Divider/>}
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
