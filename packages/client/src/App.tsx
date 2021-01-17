import { createStyles, makeStyles } from "@material-ui/core/styles";

import Loading from "./components/Loading";
import Page from "./components/Page";
import LoginDialog from "./ui/LoginDialog";
import type { View } from "./utils/navigation";
import { useState } from "./utils/state";
import type { ReactResult } from "./utils/types";

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      flex: 1,
    },
  }));

interface PageContentProps {
  view: View;
}

function PageContent({
  view,
}: PageContentProps): ReactResult {
  return <p>Hi</p>;
}

export default function App(): ReactResult {
  let state = useState();
  let classes = useStyles();

  if (!state) {
    return <Page>
      <Loading className={classes.content}/>
    </Page>;
  }

  if (!state.user) {
    return <Page>
      <LoginDialog/>
    </Page>;
  }

  if (!state.view) {
    return <Page>
      <Loading className={classes.content}/>
    </Page>;
  }

  return <Page>
    <PageContent view={state.view}/>
  </Page>;
}
