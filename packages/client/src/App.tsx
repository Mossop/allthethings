import { createStyles, makeStyles } from "@material-ui/core/styles";

import Loading from "./components/Loading";
import Page from "./components/Page";
import { useCurrentUserQuery } from "./schema/queries";
import LoginDialog from "./ui/LoginDialog";
import type { View } from "./utils/navigation";
import { useView } from "./utils/navigation";
import type { ReactResult } from "./utils/types";
import { UserProvider } from "./utils/user";

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
  let { loading, data, error } = useCurrentUserQuery();
  let view = useView();
  let classes = useStyles();

  if (loading || !view) {
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
    return <UserProvider value={data.user}>
      <Page>
        <PageContent view={view}/>
      </Page>
    </UserProvider>;
  }

  return <Page>
    <LoginDialog/>
  </Page>;
}
