import type { ReactResult } from "@allthethings/ui";
import { ReactMemo, Styles, Text } from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";

import Page from "../components/Page";
import ProjectList from "./ProjectList";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      ...Styles.pageStyles(theme),
      flex: 1,
    },
  }));

export default ReactMemo(function NotFound(): ReactResult {
  let classes = useStyles();

  return <Page sidebar={<ProjectList/>}>
    <div className={classes.content}>
      <Text>Not Found</Text>
    </div>
  </Page>;
});
