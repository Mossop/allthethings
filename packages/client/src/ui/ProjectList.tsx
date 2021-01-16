import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import type { ReactElement } from "react";
import { useState, useCallback, useMemo } from "react";

import { AddProjectIcon, ProjectIcon, InboxIcon } from "../components/Icons";
import { useListProjectsQuery } from "../schema/queries";
import { upsert } from "../utils/collections";
import type { View } from "../utils/navigation";
import { pushState, ViewType } from "../utils/navigation";
import { ReactMemo } from "../utils/types";
import type { ReactResult } from "../utils/types";
import CreateProjectDialog from "./CreateProjectDialog";

interface StyleProps {
  depth: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      paddingRight: theme.spacing(1),
      minWidth: theme.spacing(1) + 24,
      fontSize: theme.typography.pxToRem(24),
    },
    item: ({ depth }: StyleProps) => ({
      paddingLeft: theme.spacing(2 + depth * 2),
    }),
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
} & ({
  href: string;
  onClick?: undefined;
} | {
  onClick: () => void;
  href?: undefined;
});

const Item = ReactMemo(function Item({
  selected,
  href,
  onClick,
  label,
  icon,
  depth,
}: ItemProps): ReactResult {
  let classes = useStyles({ depth });

  let className = clsx(
    classes.item,
    selected ? classes.selectedItem : classes.selectableItem,
  );

  let click = useCallback((event: React.MouseEvent) => {
    if (event.button != 0 || !href) {
      return;
    }

    event.preventDefault();
    pushState(href);
  }, [href]);

  if (selected) {
    return <ListItem
      dense={true}
      className={className}
      component="div"
    >
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </ListItem>;
  } else if (href) {
    return <ListItem
      dense={true}
      button={true}
      className={className}
      component="a"
      href={href}
      onClick={click}
    >
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </ListItem>;
  } else {
    return <ListItem
      dense={true}
      button={true}
      className={className}
      onClick={onClick}
    >
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </ListItem>;
  }
});

interface Project {
  id: string;
  stub: string;
  name: string;
}

interface ProjectItemProps {
  map: Map<string | null, Project[]>;
  project: Project;
  selectedOwner: string | null;
  baseUrl: string;
  depth: number
}

const ProjectItem = ReactMemo(function ProjectItem({
  map,
  project,
  selectedOwner,
  baseUrl,
  depth,
}: ProjectItemProps): ReactResult {
  let children = map.get(project.id);
  let selected = project.id == selectedOwner;

  baseUrl += `${project.stub}/`;

  return <>
    <Item
      href={baseUrl}
      label={project.name}
      selected={selected}
      depth={depth}
      icon={<ProjectIcon/>}
    />
    {
      children && <List>
        {
          children.map((child: Project) => <ProjectItem
            key={child.id}
            map={map}
            project={child}
            selectedOwner={selectedOwner}
            baseUrl={baseUrl}
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
  let selectedOwner = "selectedOwner" in view ? view.selectedOwner : null;

  let { data } = useListProjectsQuery({
    variables: {
      id: view.selectedContext,
    },
  });

  let projectMap = useMemo((): Map<string | null, Project[]> => {
    let map = new Map<string | null, Project[]>();

    for (let project of data?.context?.projects ?? []) {
      let parent = project.parent?.id ?? null;

      let list = upsert(map, parent, () => []);
      list.push(project);
    }

    return map;
  }, [data]);

  let projects = projectMap.get(null);
  let baseUrl = data?.context?.__typename == "NamedContext" ? `/${data.context.stub}/` : "/";

  let [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  let openCreateProjectDialog = useCallback(() => {
    setShowCreateProjectDialog(true);
  }, []);
  let closeCreateProjectDialog = useCallback(() => {
    setShowCreateProjectDialog(false);
  }, []);

  return <>
    <List component="div">
      <Item
        href={`${baseUrl}inbox`}
        icon={<InboxIcon/>}
        selected={view.type == ViewType.Inbox}
        label="Inbox"
        depth={0}
      />
      <Item
        href={baseUrl}
        icon={<ProjectIcon/>}
        selected={selectedOwner == view.selectedContext}
        label="Uncategorized"
        depth={0}
      />
      {
        projects?.map((project: Project) => <ProjectItem
          key={project.id}
          map={projectMap}
          project={project}
          selectedOwner={selectedOwner}
          baseUrl={baseUrl}
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
    {showCreateProjectDialog && <CreateProjectDialog onClose={closeCreateProjectDialog}/>}
  </>;
});
