import { Icons, SelectableListItem, useBoolState, ReactMemo } from "@allthethings/ui";
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
import type { ReactElement } from "react";
import { useMemo, forwardRef } from "react";

import { useInboxContents } from "../schema";
import type { Project, TaskList, Item } from "../schema";
import { nameSorted } from "../utils/collections";
import { Filters, isVisible } from "../utils/filter";
import {
  useCurrentContext,
  useProjectRoot,
  useUrl,
  useLoggedInView,
  ViewType,
} from "../utils/view";
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

  let className = clsx(
    classes.item,
    selected ? classes.selectedItem : classes.selectableItem,
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

  let classes = useStyles({ depth });

  return <>
    <TreeItem
      url={url}
      label={project.name}
      selected={selected}
      depth={depth}
      taskCount={project.remainingTasks}
      icon={<Icons.Project className={classes.grabHandle}/>}
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

  let view = useLoggedInView();
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

  let inboxContents = useInboxContents();
  let inboxLabel = useMemo(() => {
    let items = inboxContents.items.filter(
      (item: Item): boolean => isVisible(item, Filters.Normal),
    );

    return items.length ? `Inbox (${items.length})` : "Inbox";
  }, [inboxContents]);

  return <Paper
    elevation={2}
    component="nav"
    square={true}
    className={classes.nav}
  >
    <List component="div" className={classes.list}>
      <TreeItem
        url={inboxUrl}
        icon={<Icons.Inbox/>}
        selected={view.type == ViewType.Inbox}
        label={inboxLabel}
        depth={0}
      />
      <TreeItem
        url={tasksUrl}
        icon={<Icons.Project/>}
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
          taskList={taskList}
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
