import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import alpha from "color-alpha";
import type { ReactElement } from "react";
import { forwardRef, useState, useCallback } from "react";
import type { DragSourceMonitor, DropTargetMonitor } from "react-dnd";

import { AddProjectIcon, ProjectIcon, InboxIcon } from "../components/Icons";
import { useMoveProjectMutation, useMoveSectionMutation } from "../schema/mutations";
import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type { DraggedProject, DraggedSection } from "../utils/drag";
import { useDrag, DragType, useDrop } from "../utils/drag";
import type { View } from "../utils/navigation";
import { pushUrl, ViewType } from "../utils/navigation";
import { nameSorted } from "../utils/sort";
import type { Project, TaskList } from "../utils/state";
import { useCurrentContext, useUrl, useProjectRoot } from "../utils/state";
import { dragging } from "../utils/styles";
import { ReactMemo } from "../utils/types";
import type { ReactResult, ReactRef } from "../utils/types";
import CreateProjectDialog from "./CreateProjectDialog";

interface StyleProps {
  depth: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grabHandle: {
      cursor: "grab",
    },
    list: {
      paddingTop: theme.spacing(2),
      paddingBottom: 0,
    },
    innerList: {
      padding: 0,
    },
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    icon: {
      paddingRight: theme.spacing(1),
      minWidth: theme.spacing(1) + 24,
      fontSize: theme.typography.pxToRem(24),
    },
    item: ({ depth }: StyleProps) => ({
      paddingLeft: theme.spacing(3 + depth * 2),
      paddingRight: theme.spacing(3),
    }),
    dragging,
    dropping: {
      backgroundColor: alpha(theme.palette.text.secondary, 0.2),
    },
    projectList: {
      backgroundColor: alpha(theme.palette.text.secondary, 0.2),
    },
    selectedItem: {
      backgroundColor: theme.palette.text.secondary,
      color: theme.palette.getContrastText(theme.palette.text.secondary),
    },
    selectableItem: {
      cursor: "pointer",
    },
  }));

type ItemProps = {
  selected?: boolean;
  label: string;
  icon: ReactElement;
  depth: number;
  className?: string;
} & ({
  url: URL;
  onClick?: undefined;
} | {
  onClick: () => void;
  url?: URL;
});

const Item = ReactMemo(forwardRef(function Item({
  selected,
  url,
  onClick,
  label,
  icon,
  depth,
  className: providedClass,
}: ItemProps, ref: ReactRef | null): ReactResult {
  let classes = useStyles({ depth });

  let className = clsx(
    classes.item,
    selected ? classes.selectedItem : classes.selectableItem,
    providedClass,
  );

  let click = useCallback((event: React.MouseEvent) => {
    if (event.button != 0 || !url) {
      return;
    }

    event.preventDefault();
    pushUrl(url);
  }, [url]);

  if (selected) {
    return <ListItem
      ref={ref}
      dense={true}
      className={className}
      component="div"
    >
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </ListItem>;
  } else if (url) {
    return <ListItem
      ref={ref}
      dense={true}
      button={true}
      className={className}
      component="a"
      href={url.toString()}
      onClick={click}
    >
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </ListItem>;
  } else {
    return <ListItem
      ref={ref}
      dense={true}
      button={true}
      className={className}
      onClick={onClick}
    >
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </ListItem>;
  }
}));

interface ProjectItemProps {
  project: Project;
  taskList: TaskList | null;
  depth: number
}

const ProjectItem = ReactMemo(function ProjectItem({
  project,
  taskList,
  depth,
}: ProjectItemProps): ReactResult {
  let selected = project.id == taskList?.id;
  let url = useUrl({
    type: ViewType.TaskList,
    taskList: project,
  });

  let [{ isDragging }, dragRef] = useDrag({
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

  let canDrop = useCallback((item: DraggedProject | DraggedSection): boolean => {
    if (item.type == DragType.Section) {
      return item.section.taskList !== project;
    }

    let parent: Project | null = project;
    while (parent) {
      if (parent.id == item.project.id) {
        return false;
      }

      parent = parent.parent;
    }
    return true;
  }, [project]);

  let [moveProject] = useMoveProjectMutation({
    refetchQueries: [refetchListContextStateQuery()],
  });

  let [moveSection] = useMoveSectionMutation();

  let drop = useCallback(
    (item: DraggedProject | DraggedSection, monitor: DropTargetMonitor): void => {
      if (monitor.didDrop()) {
        return;
      }

      if (item.type == DragType.Project) {
        void moveProject({
          variables: {
            id: item.project.id,
            taskList: project.id,
          },
        });
      } else {
        void moveSection({
          variables: {
            id: item.section.id,
            taskList: project.id,
            index: null,
          },
          refetchQueries: [
            refetchListTaskListQuery({
              taskList: project.id,
            }),
            refetchListTaskListQuery({
              taskList: item.section.taskList.id,
            }),
          ],
        });
      }
    },
    [moveProject, moveSection, project],
  );

  let [{ isDropping }, dropRef] = useDrop({
    accept: [DragType.Project, DragType.Section],
    canDrop,
    collect: (monitor: DropTargetMonitor) => {
      return {
        isDropping: monitor.isOver() && monitor.canDrop(),
      };
    },
    drop,
  });

  let ref = useCallback((element: ReactElement | Element | null) => {
    dragRef(element);
    dropRef(element);
  }, [dragRef, dropRef]);

  let classes = useStyles({ depth });

  return <>
    <Item
      ref={ref}
      url={url}
      label={project.name}
      selected={selected && !isDragging}
      depth={depth}
      icon={<ProjectIcon className={classes.grabHandle}/>}
      className={clsx(isDragging && classes.dragging, isDropping && classes.dropping)}
    />
    {
      project.subprojects.length > 0 && <List className={classes.innerList}>
        {
          nameSorted(project.subprojects).map((child: Project) => <ProjectItem
            key={child.id}
            project={child}
            taskList={taskList}
            depth={depth + 1}
          />)
        }
      </List>
    }
  </>;
});

interface ProjectListProps {
  view: View;
}

export default ReactMemo(function ProjectList({
  view,
}: ProjectListProps): ReactResult {
  let classes = useStyles({ depth: 0 });

  let root = useProjectRoot();
  let context = useCurrentContext();
  let taskList = "taskList" in view ? view.taskList : null;

  let [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  let openCreateProjectDialog = useCallback(() => {
    setShowCreateProjectDialog(true);
  }, []);
  let closeCreateProjectDialog = useCallback(() => {
    setShowCreateProjectDialog(false);
  }, []);

  let inboxUrl = useUrl({
    type: ViewType.Inbox,
  });
  let tasksUrl = useUrl({
    type: ViewType.TaskList,
    taskList: root,
  });

  let [moveProject] = useMoveProjectMutation({
    refetchQueries: [refetchListContextStateQuery()],
  });
  let [moveSection] = useMoveSectionMutation();

  let drop = useCallback(
    (item: DraggedProject | DraggedSection, monitor: DropTargetMonitor): void => {
      if (monitor.didDrop() || !("taskList" in view)) {
        return;
      }

      if (item.type == DragType.Project) {
        void moveProject({
          variables: {
            id: item.project.id,
            taskList: root.id,
          },
        });
      } else {
        void moveSection({
          variables: {
            id: item.section.id,
            taskList: root.id,
            index: null,
          },
          refetchQueries: [
            refetchListTaskListQuery({
              taskList: root.id,
            }),
            refetchListTaskListQuery({
              taskList: item.section.taskList.id,
            }),
          ],
        });
      }
    },
    [moveProject, moveSection, view, root],
  );

  let [{ isDragging, isOver }, dropRef] = useDrop({
    accept: [DragType.Project, DragType.Section],
    canDrop(item: DraggedProject | DraggedSection): boolean {
      if (item.type == DragType.Section) {
        return item.section.taskList !== root;
      }

      return !!item.project.parent;
    },
    collect: (monitor: DropTargetMonitor) => {
      return {
        isDragging: monitor.isOver(),
        isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
      };
    },
    drop,
  });

  return <Paper
    elevation={2}
    component="nav"
    square={true}
    className={clsx(isOver && classes.projectList)}
    ref={dropRef}
  >
    <List component="div" className={classes.list}>
      <Item
        url={inboxUrl}
        icon={<InboxIcon/>}
        selected={view.type == ViewType.Inbox}
        label="Inbox"
        depth={0}
      />
      <Item
        url={tasksUrl}
        icon={<ProjectIcon/>}
        selected={view.type == ViewType.TaskList && taskList?.id == root.id}
        label={context?.name ?? "Tasks"}
        depth={0}
      />
      <Divider className={classes.divider}/>
      {
        nameSorted(root.subprojects).map((project: Project) => <ProjectItem
          key={project.id}
          project={project}
          taskList={isDragging ? null : taskList}
          depth={0}
        />)
      }
      <Item
        onClick={openCreateProjectDialog}
        icon={<AddProjectIcon/>}
        label="Add Project..."
        depth={0}
      />
    </List>
    {
      showCreateProjectDialog && <CreateProjectDialog
        onClose={closeCreateProjectDialog}
        taskList={root}
      />
    }
  </Paper>;
});
