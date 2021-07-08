import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";

import type { ReactResult } from "#ui";
import { ReactMemo, Styles, Text } from "#ui";

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
