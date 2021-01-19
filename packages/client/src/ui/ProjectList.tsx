import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import type { ReactElement } from "react";
import { useState, useCallback } from "react";

import { AddProjectIcon, ProjectIcon, InboxIcon } from "../components/Icons";
import type { View } from "../utils/navigation";
import { pushState, ViewType } from "../utils/navigation";
import { nameSorted } from "../utils/sort";
import type { NamedContext, Project, User } from "../utils/state";
import { useUrl, useCurrentContext } from "../utils/state";
import { ReactMemo } from "../utils/types";
import type { ReactResult } from "../utils/types";
import CreateProjectDialog from "./CreateProjectDialog";

interface StyleProps {
  depth: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

type ItemProps = {
  selected?: boolean;
  label: string;
  icon: ReactElement;
  depth: number;
} & ({
  url: URL;
  onClick?: undefined;
} | {
  onClick: () => void;
  url?: URL;
});

const Item = ReactMemo(function Item({
  selected,
  url,
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
    if (event.button != 0 || !url) {
      return;
    }

    event.preventDefault();
    pushState(url);
  }, [url]);

  if (selected) {
    return <ListItem
      dense={true}
      className={className}
      component="div"
    >
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </ListItem>;
  } else if (url) {
    return <ListItem
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

interface ProjectItemProps {
  project: Project;
  selectedOwner: User | NamedContext | Project | null;
  depth: number
}

const ProjectItem = ReactMemo(function ProjectItem({
  project,
  selectedOwner,
  depth,
}: ProjectItemProps): ReactResult {
  let selected = project.id == selectedOwner?.id;
  let classes = useStyles({ depth });
  let url = useUrl({
    type: ViewType.Owner,
    selectedOwner: project,
  });

  return <>
    <Item
      url={url}
      label={project.name}
      selected={selected}
      depth={depth}
      icon={<ProjectIcon/>}
    />
    {
      project.subprojects.length > 0 && <List className={classes.innerList}>
        {
          nameSorted(project.subprojects).map((child: Project) => <ProjectItem
            key={child.id}
            project={child}
            selectedOwner={selectedOwner}
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
  let selectedOwner = "selectedOwner" in view ? view.selectedOwner : null;

  let context = useCurrentContext();

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
  let tasksUrl = useUrl(context
    ? {
      type: ViewType.Owner,
      selectedOwner: context,
    }
    : null);

  if (!context) {
    return null;
  }

  return <>
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
        selected={view.type == ViewType.Owner && selectedOwner?.id == context.id}
        label="Tasks"
        depth={0}
      />
      <Divider className={classes.divider}/>
      {
        nameSorted(context.subprojects).map((project: Project) => <ProjectItem
          key={project.id}
          project={project}
          selectedOwner={selectedOwner}
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
        owner={context}
      />
    }
  </>;
});
