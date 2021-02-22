import type { ApolloClient } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import { CssBaseline, createMuiTheme, ThemeProvider } from "@material-ui/core";
import type { Theme } from "@material-ui/core";

import Main from "./ui/Main";
import { DragTracker } from "./utils/drag";
import type { ReactResult } from "./utils/types";
import { ViewListener } from "./utils/view";

const base = createMuiTheme();

/* eslint-disable @typescript-eslint/naming-convention */
const baseTheme = (theme: Theme): Theme => createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#CEA07E",
      contrastText: "#000000",
    },
    secondary: {
      main: "#b3afa7",
      contrastText: "#000000",
    },
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        "*": {
          fontFamily: "inherit",
          fontWeight: "inherit",
          fontSize: "inherit",
          letterSpacing: "inherit",
          lineHeight: "inherit",
          padding: 0,
          margin: 0,
          color: "inherit",
          cursor: "inherit",
        },
        "html": {
          overflow: "hidden",
        },
        "body": {
          cursor: "default",
        },
      },
    },
    // @ts-ignore
    MuiSpeedDialIcon: {
      icon: {
        fontSize: theme.typography.pxToRem(24),
      },
    },
    MuiSpeedDialAction: {
      fab: {
        fontSize: theme.typography.pxToRem(24),
      },
    },
    MuiIconButton: {
      root: {
        fontSize: "inherit",
        color: "inherit",
      },
    },
    MuiListItemIcon: {
      root: {
        color: "inherit",
      },
    },
    MuiFormControl: {
      marginNormal: {
        marginTop: theme.spacing(1),
      },
    },
    MuiDialog: {
      paper: {
        minWidth: "22rem",
      },
    },
    MuiDialogTitle: {
      root: {
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: 0,
      },
    },
    MuiDialogContent: {
      root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(4),
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "stretch",
      },
    },
    MuiDialogActions: {
      root: {
        paddingTop: 0,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(2),
      },
    },
  },
});
/* eslint-enable @typescript-eslint/naming-convention */

export interface AppProps {
  client: ApolloClient<unknown>;
}

export default function App({
  client,
}: AppProps): ReactResult {
  return <ThemeProvider theme={base}>
    <ThemeProvider theme={baseTheme}>
      <ApolloProvider client={client}>
        <CssBaseline/>
        <ViewListener>
          <DragTracker>
            <Main/>
          </DragTracker>
        </ViewListener>
      </ApolloProvider>
    </ThemeProvider>
  </ThemeProvider>;
}
