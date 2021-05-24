import { Icons, Styles, SelectableListItem, useBoolState, ReactMemo } from "@allthethings/ui";
import type { ReactResult, ReactRef } from "@allthethings/ui";
import {
  Divider,
  List,
  Paper,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import clsx from "clsx";
import alpha from "color-alpha";
import type { ReactElement } from "react";
import { useMemo, forwardRef, useCallback } from "react";
import mergeRefs from "react-merge-refs";

import { nameSorted } from "../utils/collections";
import type {
  DraggedItem,
  DraggedProject,
  DraggedSection,
  ItemDragResult,
  ProjectDragResult,
  SectionDragResult,
} from "../utils/drag";
import { useDragItem, useProjectDrag, useDropArea, DragType } from "../utils/drag";
import type { Project, TaskList, Item } from "../utils/state";
import { useCurrentContext, useProjectRoot } from "../utils/state";
import { Filters, isVisible, useUrl, useView, ViewType } from "../utils/view";
import CreateProjectDialog from "./CreateProjectDialog";

interface StyleProps {
  depth: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nav: {
      minWidth: 250,
    },
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
    dragging: {
      ...Styles.dragging,
    },
    dropping: {
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

type TreeItemProps = {
  selected?: boolean;
  label: string;
  icon: ReactElement;
  depth: number;
  className?: string;
  taskCount?: number;
} & ({
  url: URL;
  onClick?: undefined;
} | {
  onClick: () => void;
  url?: URL;
});

const TreeItem = ReactMemo(forwardRef(function TreeItem({
  selected,
  url,
  onClick,
  label,
  icon,
  depth,
  className: providedClass,
  taskCount,
}: TreeItemProps, ref: ReactRef | null): ReactResult {
  let classes = useStyles({ depth });
  let displaySelected = !useDragItem() && selected;

  let className = clsx(
    classes.item,
    displaySelected ? classes.selectedItem : classes.selectableItem,
    providedClass,
  );

  if (taskCount) {
    label += ` (${taskCount})`;
  }

  return <SelectableListItem
    ref={ref}
    selected={selected ?? false}
    className={className}
    iconClassName={classes.icon}
    icon={icon}
    href={url?.toString()}
    onClick={onClick}
  >
    {label}
  </SelectableListItem>;
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

  let {
    isDragging,
    dragRef,
  } = useProjectDrag(project);

  let {
    canDrop,
    isShallowOver,
    dropRef,
  } = useDropArea([DragType.Project, DragType.Section, DragType.Item], {
    getDragResult: useCallback(
      (
        item: DraggedProject | DraggedSection | DraggedItem,
      ): ProjectDragResult | SectionDragResult | ItemDragResult | null => {
        if (item.type == DragType.Item) {
          if (item.item.parent === project) {
            return null;
          }

          return {
            type: DragType.Item,
            target: project,
            before: null,
          };
        }

        if (item.type == DragType.Section) {
          if (item.item.taskList == project) {
            return null;
          }

          return {
            type: DragType.Section,
            taskList: project,
            before: null,
          };
        }

        if (item.item == project || item.item.parent == project) {
          return null;
        }

        let parent = project.parent;
        while (parent) {
          if (parent == item.item) {
            return null;
          }
          parent = parent.parent;
        }

        return {
          type: DragType.Project,
          taskList: project,
        };
      },
      [project],
    ),
  });

  let ref = mergeRefs([dragRef, dropRef]);

  let classes = useStyles({ depth });

  return <>
    <TreeItem
      ref={ref}
      url={url}
      label={project.name}
      selected={selected}
      depth={depth}
      taskCount={project.remainingTasks}
      icon={<Icons.Project className={classes.grabHandle}/>}
      className={clsx(isDragging && classes.dragging, isShallowOver && canDrop && classes.dropping)}
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

export default ReactMemo(function ProjectList(): ReactResult {
  let classes = useStyles({ depth: 0 });

  let view = useView();
  let root = useProjectRoot();
  let context = useCurrentContext();
  let taskList = "taskList" in view ? view.taskList : null;

  let [
    showCreateProjectDialog,
    openCreateProjectDialog,
    closeCreateProjectDialog,
  ] = useBoolState(false);

  let inboxUrl = useUrl({
    type: ViewType.Inbox,
  });
  let tasksUrl = useUrl({
    type: ViewType.TaskList,
    taskList: root,
  });

  let {
    canDrop: canDropOnRoot,
    isShallowOver: isShallowOverRoot,
    isOver,
    dropRef,
  } = useDropArea([DragType.Project, DragType.Section, DragType.Item], {
    getDragResult: useCallback(
      (
        item: DraggedProject | DraggedSection | DraggedItem,
      ): ProjectDragResult | SectionDragResult | ItemDragResult | null => {
        if (item.type == DragType.Item) {
          if (item.item.parent === root) {
            return null;
          }

          return {
            type: DragType.Item,
            target: root,
            before: null,
          };
        }

        if (item.type == DragType.Section) {
          if (item.item.taskList === root) {
            return null;
          }

          return {
            type: DragType.Section,
            taskList: root,
            before: null,
          };
        }

        if (item.item.parent == null) {
          return null;
        }

        return {
          type: DragType.Project,
          taskList: root,
        };
      },
      [root],
    ),
  });

  let inboxLabel = useMemo(() => {
    let items = view.user.inbox.items.filter(
      (item: Item): boolean => isVisible(item, Filters.Normal),
    );

    return items.length ? `Inbox (${items.length})` : "Inbox";
  }, [view]);

  let {
    canDrop: canDropOnInbox,
    isShallowOver: isShallowOverInbox,
    dropRef: inboxDropRef,
  } = useDropArea(DragType.Item, {
    getDragResult: useCallback(
      (item: DraggedItem): ItemDragResult | null => {
        if (item.item.parent == view.user.inbox) {
          return null;
        }

        return {
          type: DragType.Item,
          target: view.user.inbox,
          before: null,
        };
      },
      [view.user.inbox],
    ),
  });

  return <Paper
    elevation={2}
    component="nav"
    square={true}
    ref={dropRef}
    className={classes.nav}
  >
    <List component="div" className={classes.list}>
      <TreeItem
        url={inboxUrl}
        icon={<Icons.Inbox/>}
        selected={view.type == ViewType.Inbox}
        className={clsx(canDropOnInbox && isShallowOverInbox && classes.dropping)}
        label={inboxLabel}
        depth={0}
        ref={inboxDropRef}
      />
      <TreeItem
        url={tasksUrl}
        icon={<Icons.Project/>}
        className={clsx(canDropOnRoot && isShallowOverRoot && classes.dropping)}
        selected={view.type == ViewType.TaskList && taskList?.id == root.id}
        taskCount={root.remainingTasks}
        label={context?.name ?? "Tasks"}
        depth={0}
      />
      <Divider className={classes.divider}/>
      {
        nameSorted(root.subprojects).map((project: Project) => <ProjectItem
          key={project.id}
          project={project}
          taskList={isOver ? null : taskList}
          depth={0}
        />)
      }
      <TreeItem
        onClick={openCreateProjectDialog}
        icon={<Icons.Add/>}
        label="Add Project..."
        depth={0}
      />
    </List>
    {
      showCreateProjectDialog && <CreateProjectDialog
        onClosed={closeCreateProjectDialog}
        taskList={taskList ?? root}
      />
    }
  </Paper>;
});
