import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import { Text } from "../components/Text";
import type { NotFoundView } from "../utils/navigation";
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

interface NotFoundProps {
  view: NotFoundView;
}

export default ReactMemo(function NotFound({
  view,
}: NotFoundProps): ReactResult {
  let classes = useStyles();

  return <div className={classes.content}>
    <Text>Not Found</Text>
  </div>;
});
