import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";

import type { ReactResult } from "#client/utils";
import { ReactMemo, Styles, Text } from "#client/utils";

import Page from "../components/Page";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      ...Styles.pageStyles(theme),
      flex: 1,
    },
  }));

export default ReactMemo(function NotFound(): ReactResult {
  let classes = useStyles();

  return <Page>
    <div className={classes.content}>
      <Text>Not Found</Text>
    </div>
  </Page>;
});
