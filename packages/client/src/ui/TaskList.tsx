import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Fragment } from "react";

import { Heading } from "../components/Text";
import { useListTaskListQuery } from "../schema/queries";
import type { Item } from "../schema/types";
import type { TaskListView } from "../utils/navigation";
import type { Section } from "../utils/state";
import { isProject } from "../utils/state";
import { pageStyles } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import AddDial from "./AddDial";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    outer: {
      flex: 1,
      position: "relative",
    },
    content: {
      ...pageStyles(theme),
      height: "100%",
      width: "100%",
    },
    heading: {
      paddingBottom: theme.spacing(2),
    },
    section: {
    },
    sectionHeading: {
    },
    floatingAction: {
      position: "absolute",
      bottom: theme.spacing(4),
      right: theme.spacing(4),
    },
  }));

interface TaskListProps {
  view: TaskListView;
}

export default ReactMemo(function TaskList({
  view,
}: TaskListProps): ReactResult {
  let classes = useStyles();
  let { data } = useListTaskListQuery({
    variables: {
      taskList: view.taskList.id,
    },
  });

  if (!data?.taskList) {
    return null;
  }

  let { taskList } = data;

  return <div className={classes.outer}>
    <div className={classes.content}>
      {
        isProject(view.taskList) &&
        <Heading className={classes.heading}>{view.taskList.name}</Heading>
      }
      <List>
        {
          taskList.items.map((item: Item) => <ListItem key={item.id}>
            Foo
          </ListItem>)
        }
        {
          taskList.sections.map((section: Section, index: number) => <Fragment key={section.id}>
            {index + taskList.items.length > 0 && <Divider/>}
            <List>
              <ListSubheader>{section.name}</ListSubheader>
              {
                section.items.map((item: Item) => <ListItem key={item.id}>
                  Foo
                </ListItem>)
              }
            </List>
          </Fragment>)
        }
      </List>
    </div>
    <div className={classes.floatingAction}>
      <AddDial viewType={view.type} taskList={view.taskList}/>
    </div>
  </div>;
});
