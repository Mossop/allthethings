import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import { Heading } from "../components/Text";
import type { OwnerView } from "../utils/navigation";
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
    floatingAction: {
      position: "absolute",
      bottom: theme.spacing(4),
      right: theme.spacing(4),
    },
  }));

interface OwnerProps {
  view: OwnerView;
}

export default ReactMemo(function Owner({
  view,
}: OwnerProps): ReactResult {
  let classes = useStyles();

  return <div className={classes.outer}>
    <div className={classes.content}>
      {
        isProject(view.owner) &&
        <Heading className={classes.heading}>{view.owner.name}</Heading>
      }
    </div>
    <div className={classes.floatingAction}>
      <AddDial viewType={view.type} owner={view.owner}/>
    </div>
  </div>;
});