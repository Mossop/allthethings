import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import { Heading, SubHeading } from "../components/Text";
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
      paddingTop: theme.spacing(2),
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

  return <div className={classes.outer}>
    <div className={classes.content}>
      {
        isProject(view.taskList) &&
        <Heading className={classes.heading}>{view.taskList.name}</Heading>
      }
      {
        view.taskList.sections.map((section: Section) => <div
          key={section.id}
          className={classes.section}
        >
          <SubHeading className={classes.sectionHeading}>{section.name}</SubHeading>
        </div>)
      }
    </div>
    <div className={classes.floatingAction}>
      <AddDial viewType={view.type} taskList={view.taskList}/>
    </div>
  </div>;
});
