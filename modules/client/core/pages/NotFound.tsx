import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import type { ReactResult } from "../../utils";
import { ReactMemo, Styles, Text } from "../../utils";
import Page from "../components/Page";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      ...Styles.pageStyles(theme),
      flex: 1,
    },
  }),
);

export default ReactMemo(function NotFound(): ReactResult {
  let classes = useStyles();

  return (
    <Page>
      <div className={classes.content}>
        <Text>Not Found</Text>
      </div>
    </Page>
  );
});
