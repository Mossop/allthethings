import type { Theme } from "@material-ui/core";
import {
  createStyles,
  makeStyles,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";

import { ProjectIcon } from "../components/Icons";
import Page from "../components/Page";
import { Text } from "../components/Text";
import { useProjectRoot } from "../utils/state";
import { pageStyles } from "../utils/styles";
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
    listitem: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    icon: {
      paddingRight: theme.spacing(1),
      minWidth: theme.spacing(1) + 24,
      fontSize: theme.typography.pxToRem(24),
    },
  }));

function SettingsSidebar(): ReactResult {
  let classes = useStyles();

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
        <ListItemIcon className={classes.icon}><ProjectIcon/></ListItemIcon>
        <ListItemText>Back to Tasks</ListItemText>
      </ListItem>
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
