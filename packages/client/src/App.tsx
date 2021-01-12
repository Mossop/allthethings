import { createStyles, makeStyles } from "@material-ui/core/styles";
import type { ReactElement } from "react";

import Loading from "./components/Loading";
import Page from "./components/Page";
import { useCurrentUserQuery } from "./schema";
import Login from "./ui/Login";

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      flex: 1,
    },
  }));

export default function App(): ReactElement | null {
  let { loading, data, error } = useCurrentUserQuery();
  let classes = useStyles();

  if (loading) {
    return <Page>
      <Loading className={classes.content}/>
    </Page>;
  }

  if (error) {
    return <Page>
      <p>Error.</p>
    </Page>;
  }

  if (data?.user) {
    return <Page>
      <p>Logged in.</p>
    </Page>;
  }

  return <Page>
    <Login/>
  </Page>;
}
