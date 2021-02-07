import { createStyles, makeStyles } from "@material-ui/core/styles";

import Loading from "./components/Loading";
import Page from "./components/Page";
import Inbox from "./ui/Inbox";
import LoginDialog from "./ui/LoginDialog";
import NotFound from "./ui/NotFound";
import TaskList from "./ui/TaskList";
import type { View } from "./utils/navigation";
import { ViewType } from "./utils/navigation";
import { useMaybeView } from "./utils/state";
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
      return <Inbox/>;
    case ViewType.TaskList:
      return <TaskList view={view}/>;
    case ViewType.NotFound:
      return <NotFound/>;
  }
}

export default function App(): ReactResult {
  let state = useMaybeView();
  let classes = useStyles();

  if (state === undefined) {
    return <Page>
      <Loading className={classes.content}/>
    </Page>;
  }

  if (!state) {
    return <Page>
      <LoginDialog/>
    </Page>;
  }

  return <Page>
    <PageContent view={state}/>
  </Page>;
}
