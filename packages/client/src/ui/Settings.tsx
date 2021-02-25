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
import SettingsIcon from "@material-ui/icons/Settings";
import clsx from "clsx";
import { Fragment, useCallback, createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

import { BackIcon } from "../components/Icons";
import Page from "../components/Page";
import SelectableListItem from "../components/SelectableListItem";
import { Text } from "../components/Text";
import type { ClientPlugin } from "../plugins";
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
    selectedItem: {
      backgroundColor: theme.palette.text.secondary,
      color: theme.palette.getContrastText(theme.palette.text.secondary),
    },
  }));

interface SectionContextProps {
  setSection: (section: string) => void;
  section: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
let SectionContext = createContext<SectionContextProps>({
  section: "general",
  setSection: () => {
    // no-op
  },
});

export interface SettingSectionProps {
  sectionId?: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function SettingSection({
  icon,
  sectionId,
  href,
  onClick,
  children,
}: SettingSectionProps): ReactResult {
  let classes = useStyles();
  let {
    section,
    setSection,
  } = useContext(SectionContext);

  let click = useCallback(() => {
    if (onClick) {
      onClick();
    }

    if (sectionId) {
      setSection(sectionId);
    }
  }, [sectionId, onClick, setSection]);

  let selected = section == sectionId;

  return <SelectableListItem
    selected={selected}
    className={clsx(classes.listitem, selected && classes.selectedItem)}
    onClick={click}
    iconClassName={classes.icon}
    icon={icon}
    href={href}
  >
    {children}
  </SelectableListItem>;
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
      <Divider className={classes.divider}/>
      <SettingSection
        sectionId="general"
        icon={<SettingsIcon/>}
      >
        General
      </SettingSection>
      {
        plugins.map((plugin: ClientPlugin) => <Fragment key={plugin.id}>
          <Divider className={classes.divider}/>
          <List disablePadding={true}>
            <ListSubheader className={classes.pluginHeader}>
              {plugin.name}
            </ListSubheader>
            {plugin.renderPluginSections()}
          </List>
        </Fragment>)
      }
    </List>
  </Paper>;
}

export default ReactMemo(function Settings(): ReactResult {
  let classes = useStyles();
  let [section, setSection] = useState<string>("general");

  return <SectionContext.Provider value={{ section, setSection }}>
    <Page sidebar={<SettingsSidebar/>}>
      <div className={classes.content}>
        <Text>Settings</Text>
      </div>
    </Page>
  </SectionContext.Provider>;
});
