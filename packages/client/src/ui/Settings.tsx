import type { Theme } from "@material-ui/core";
import {
  Divider,
  ListSubheader,
  createStyles,
  makeStyles,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";

import { BackIcon } from "../components/Icons";
import Page from "../components/Page";
import { Text } from "../components/Text";
import type { ClientPlugin, PluginSettingItem } from "../plugins";
import { usePlugins } from "../plugins";
import { useProjectRoot } from "../utils/state";
import { flexCentered, flexRow, pageStyles } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { pushClickedLink, useUrl, ViewType } from "../utils/view";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      ...pageStyles(theme),
      flex: 1,
    },
    list: {
      paddingTop: theme.spacing(2),
      paddingBottom: 0,
    },
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    listitem: {
      ...flexRow,
      alignItems: "center",
    },
    icon: {
      paddingRight: theme.spacing(1),
      minWidth: theme.spacing(1) + 24,
      fontSize: theme.typography.pxToRem(24),
      ...flexCentered,
    },
    pluginHeader: {
      lineHeight: "inherit",
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
  }));

interface PluginSidebarItemsProps {
  plugin: ClientPlugin;
}

function PluginSidebarItems({
  plugin,
}: PluginSidebarItemsProps): ReactResult {
  let classes = useStyles();
  let items = plugin.useSettingsItems();

  if (items.length == 0) {
    return null;
  }

  return <>
    <Divider className={classes.divider}/>
    <List disablePadding={true}>
      <ListSubheader className={classes.pluginHeader}>
        {plugin.name}
      </ListSubheader>
      {
        items.map((sidebarItem: PluginSettingItem) => <ListItem
          key={sidebarItem.id}
          dense={true}
          className={classes.listitem}
        >
          <ListItemIcon className={classes.icon}>{sidebarItem.icon}</ListItemIcon>
          <ListItemText>{sidebarItem.label}</ListItemText>
        </ListItem>)
      }
    </List>
  </>;
}

function SettingsSidebar(): ReactResult {
  let classes = useStyles();
  let plugins = usePlugins();

  let taskLink = useUrl({
    type: ViewType.TaskList,
    taskList: useProjectRoot(),
  });

  return <Paper
    elevation={2}
    component="nav"
    square={true}
  >
    <List component="div" className={classes.list}>
      <ListItem
        dense={true}
        button={true}
        className={classes.listitem}
        component="a"
        href={taskLink.toString()}
        onClick={pushClickedLink}
      >
        <ListItemIcon className={classes.icon}><BackIcon/></ListItemIcon>
        <ListItemText>Back to Tasks</ListItemText>
      </ListItem>
      {
        plugins.map((plugin: ClientPlugin) => <PluginSidebarItems
          key={plugin.id}
          plugin={plugin}
        />)
      }
    </List>
  </Paper>;
}

export default ReactMemo(function Settings(): ReactResult {
  let classes = useStyles();

  return <Page sidebar={<SettingsSidebar/>}>
    <div className={classes.content}>
      <Text>Settings</Text>
    </div>
  </Page>;
});
