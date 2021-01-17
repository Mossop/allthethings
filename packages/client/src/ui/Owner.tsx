import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import { Text } from "../components/Text";
import type { OwnerView } from "../utils/navigation";
import { pageStyles } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

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
      <Text>Owner</Text>
    </div>
  </div>;
});
