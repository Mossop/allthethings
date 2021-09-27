import type { Theme } from "@material-ui/core";
import { Divider, makeStyles, createStyles } from "@material-ui/core";
import ReactMarkdown from "react-markdown";

import {
  Styles,
  Loading,
  ReactMemo,
  Link,
  queryHook,
  api,
} from "#client/utils";
import type { ReactResult } from "#client/utils";

import Page from "../components/Page";
import { useUrl, ViewType } from "../utils/view";
import NotFound from "./NotFound";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loading: {
      flex: 1,
    },
    content: {
      padding: theme.spacing(2),
      flexGrow: 1,
      flexShrink: 1,
      overflowX: "hidden",
      overflowY: "auto",

      "& h1": {
        fontSize: "1.5rem",
        fontWeight: "bold",
        textAlign: "center",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(3),
      },
      "& h2": {
        fontSize: "1.25rem",
        fontWeight: "bold",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(3),
      },
      "& p": {
        marginBottom: theme.spacing(1),
      },
      "& li": {
        marginLeft: theme.spacing(4),
      },
    },
    divider: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
    bottom: {
      ...Styles.flexCentered,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
    },
    innerBottom: {
      ...Styles.flexCenteredRow,
      justifyContent: "space-between",
    },
    bottomLink: {
      color: theme.palette.primary.main,
    },
  }),
);

const usePageContentQuery = queryHook(api.page.getPageContent, {
  format: "text",
});

export interface MarkdownPageProps {
  path: string;
}

export default ReactMemo(function MarkdownPage({
  path,
}: MarkdownPageProps): ReactResult {
  let classes = useStyles();

  let [data, { error }] = usePageContentQuery({ path });

  let privacyUrl = useUrl({
    type: ViewType.Page,
    path: "/privacy",
  });

  if (error) {
    return <NotFound />;
  }

  return (
    <Page>
      {data ? (
        <ReactMarkdown className={classes.content}>{data}</ReactMarkdown>
      ) : (
        <Loading className={classes.loading} />
      )}
      <Divider className={classes.divider} />
      <div className={classes.bottom}>
        <div className={classes.innerBottom}>
          <Link className={classes.bottomLink} href={privacyUrl}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </Page>
  );
});
