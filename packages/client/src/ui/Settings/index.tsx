import type { ClientPlugin, ReactResult } from "@allthethings/ui";
import {
  SectionContext,
  SettingSection,
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
import SettingsIcon from "@material-ui/icons/Settings";
import { Fragment, useCallback, useState } from "react";

import Page from "../../components/Page";
import { useProjectRoot } from "../../utils/state";
import { useUrl, ViewType } from "../../utils/view";

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
    taskList: useProjectRoot(),
  });

  return <Paper
    elevation={2}
    component="nav"
    square={true}
  >
    <List component="div" className={classes.list}>
      <SettingSection
        href={taskLink.toString()}
        icon={<Icons.Back/>}
      >
        Back to Tasks
      </SettingSection>
      <Divider className={classes.divider}/>
      <SettingSection
        sectionId="general"
        icon={<SettingsIcon/>}
      >
        General
      </SettingSection>
      {
        plugins.map((plugin: ClientPlugin) => <Fragment key={plugin.serverId}>
          <Divider className={classes.divider}/>
          <List disablePadding={true}>
            <ListSubheader className={classes.pluginHeader}>
              {plugin.name}
            </ListSubheader>
            {plugin.renderPluginSettingsSections()}
          </List>
        </Fragment>)
      }
    </List>
  </Paper>;
}

interface SettingsPageProps {
  section: string;
  pluginId?: string;
}

const SettingsPage = ReactMemo(function SettingsPage({
  section,
  pluginId,
}: SettingsPageProps): ReactResult {
  let plugins = usePlugins();

  if (pluginId) {
    for (let plugin of plugins) {
      if (plugin.serverId == pluginId) {
        return plugin.renderPluginSettingsSection(section);
      }
    }
  } else {
    switch (section) {
      case "general":
        return <Text>General settings.</Text>;
    }
  }

  return <Text>Unknown settings.</Text>;
});

interface SectionState {
  section: string;
  pluginId?: string;
}

export default ReactMemo(function Settings(): ReactResult {
  let classes = useStyles();
  let [{ section, pluginId }, setSection] = useState<SectionState>({
    section: "general",
  });

  let updateSection = useCallback((section: string, pluginId?: string): void => {
    setSection({
      section,
      pluginId,
    });
  }, []);

  return <SectionContext.Provider value={{ section, setSection: updateSection }}>
    <Page sidebar={<SettingsSidebar/>}>
      <div className={classes.content}>
        <SettingsPage section={section} pluginId={pluginId}/>
      </div>
    </Page>
  </SectionContext.Provider>;
});
