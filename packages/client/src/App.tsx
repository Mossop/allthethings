import { createStyles, makeStyles } from "@material-ui/core/styles";

import Loading from "./components/Loading";
import Page from "./components/Page";
import Inbox from "./ui/Inbox";
import LoginDialog from "./ui/LoginDialog";
import NotFound from "./ui/NotFound";
import Owner from "./ui/Owner";
import type { View } from "./utils/navigation";
import { ViewType } from "./utils/navigation";
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
  switch (view.type) {
    case ViewType.Inbox:
      return <Inbox view={view}/>;
    case ViewType.Owner:
      return <Owner view={view}/>;
    case ViewType.NotFound:
      return <NotFound view={view}/>;
  }
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
