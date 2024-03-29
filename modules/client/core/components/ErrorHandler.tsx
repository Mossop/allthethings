import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import type { ReactNode } from "react";
import { PureComponent } from "react";

import { Heading } from "../../utils";
import type { ReactChildren, ReactResult } from "../../utils";
import Page from "./Page";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    heading: {
      margin: theme.spacing(2),
    },
    stack: {
      margin: theme.spacing(2),
      fontFamily: "monospace",
    },
  }),
);

interface ErrorPageProps {
  error: Error;
}

function ErrorPage({ error }: ErrorPageProps): ReactResult {
  let classes = useStyles();

  return (
    <Page>
      <div>
        <Heading className={classes.heading}>{error.message}</Heading>
        {error.stack && <pre className={classes.stack}>{error.stack}</pre>}
      </div>
    </Page>
  );
}

interface ErrorHandlerState {
  error: Error | null;
}

export default class ErrorHandler extends PureComponent<
  ReactChildren,
  ErrorHandlerState
> {
  public constructor(props: ReactChildren) {
    super(props);

    this.state = {
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorHandlerState {
    return {
      error,
    };
  }

  public override render(): ReactNode {
    if (this.state.error) {
      return <ErrorPage error={this.state.error} />;
    }

    return this.props.children;
  }
}
