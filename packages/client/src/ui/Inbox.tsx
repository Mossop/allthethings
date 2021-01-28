import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import { InboxIcon } from "../components/Icons";
import { Heading } from "../components/Text";
import type { InboxView } from "../utils/navigation";
import { flexRow, pageStyles } from "../utils/styles";
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
      ...flexRow,
      alignItems: "center",
    },
    headingText: {
      padding: theme.spacing(1),
    },
    floatingAction: {
      position: "absolute",
      bottom: theme.spacing(4),
      right: theme.spacing(4),
    },
  }));

interface InboxProps {
  view: InboxView;
}

export default ReactMemo(function Inbox({
  view,
}: InboxProps): ReactResult {
  let classes = useStyles();

  return <div className={classes.outer}>
    <div className={classes.content}>
      <div className={classes.heading}>
        <InboxIcon/>
        <Heading className={classes.headingText}>Inbox</Heading>
      </div>
    </div>
    <div className={classes.floatingAction}>
      <AddDial viewType={view.type} taskList={view.context ?? view.user}/>
    </div>
  </div>;
});
