import type { ClientPlugin, ReactResult } from "@allthethings/ui";
import {
  SettingsContext,
  SettingsPageItem,
  usePlugins,
  ReactMemo,
  Icons,
  Styles,
  Text,
} from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import {
  Divider,
  ListSubheader,
  createStyles,
  makeStyles,
  Paper,
  List,
} from "@material-ui/core";
import AdminIcon from "@material-ui/icons/BusinessCenter";
import SettingsIcon from "@material-ui/icons/Settings";
import { Fragment, useCallback } from "react";

import Page from "../../components/Page";
import { useUser } from "../../utils/globalState";
import {
  pushView,
  useUrl,
  ViewType,
  useCurrentContext,
} from "../../utils/view";
import AdminPage from "./AdminPage";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      ...Styles.pageStyles(theme),
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
    pluginHeader: {
      lineHeight: "inherit",
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
  }));

function SettingsSidebar(): ReactResult {
  let classes = useStyles();
  let plugins = usePlugins();

  let taskLink = useUrl({
    type: ViewType.TaskList,
    taskList: useCurrentContext(),
  });

  let user = useUser();

  return <Paper
    elevation={2}
    component="nav"
    square={true}
  >
    <List component="div" className={classes.list}>
      <SettingsPageItem
        href={taskLink.toString()}
        icon={<Icons.Back/>}
      >
        Back to Tasks
      </SettingsPageItem>
      <Divider className={classes.divider}/>
      <SettingsPageItem
        page="general"
        icon={<SettingsIcon/>}
      >
        General
      </SettingsPageItem>
      {
        user.isAdmin && <SettingsPageItem
          page="admin"
          icon={<AdminIcon/>}
        >
          Administration
        </SettingsPageItem>
      }
      {
        plugins.map((plugin: ClientPlugin) => plugin.renderPluginSettingsPageList
          ? <Fragment key={plugin.serverId}>
            <Divider className={classes.divider}/>
            <List disablePadding={true}>
              <ListSubheader className={classes.pluginHeader}>
                {plugin.name}
              </ListSubheader>
              {plugin.renderPluginSettingsPageList()}
            </List>
          </Fragment>
          : null)
      }
    </List>
  </Paper>;
}

interface SettingsPageProps {
  page: string;
  pluginId?: string;
}

const SettingsPage = ReactMemo(function SettingsPage({
  page,
  pluginId,
}: SettingsPageProps): ReactResult {
  let plugins = usePlugins();

  if (pluginId) {
    for (let plugin of plugins) {
      if (plugin.serverId == pluginId && plugin.renderPluginSettingsPage) {
        return plugin.renderPluginSettingsPage(page);
      }
    }
  } else {
    switch (page) {
      case "general":
        return <Text>General settings.</Text>;
      case "admin":
        return <AdminPage/>;
    }
  }

  return <Text>Unknown settings.</Text>;
});

interface SettingsProps {
  page: string;
  pluginId?: string;
}

export default ReactMemo(function Settings({
  page,
  pluginId,
}: SettingsProps): ReactResult {
  let classes = useStyles();

  let updateSection = useCallback((page: string, pluginId?: string): void => {
    pushView({
      type: ViewType.Settings,
      page,
      pluginId,
    });
  }, []);

  return <SettingsContext.Provider value={{ page, setPage: updateSection }}>
    <Page sidebar={<SettingsSidebar/>}>
      <div className={classes.content}>
        <SettingsPage page={page} pluginId={pluginId}/>
      </div>
    </Page>
  </SettingsContext.Provider>;
});
