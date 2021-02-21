import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";

import { Text } from "../components/Text";
import { pageStyles } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      ...pageStyles(theme),
      flex: 1,
    },
  }));

export default ReactMemo(function NotFound(): ReactResult {
  let classes = useStyles();

  return <div className={classes.content}>
    <Text>Not Found</Text>
  </div>;
});
