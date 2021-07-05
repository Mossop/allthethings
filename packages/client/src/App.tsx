import type { ReactResult } from "@allthethings/ui";
import { UIProvider } from "@allthethings/ui";
import type { ApolloClient } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import {
  CssBaseline,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core";
import type { Theme } from "@material-ui/core";

import ErrorHandler from "./ui/ErrorHandler";
import Main from "./ui/Main";
import { DragContext } from "./utils/drag";

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
      main: "#7EACCE",
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
          textDecoration: "none",
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
        <ErrorHandler>
          <UIProvider>
            <DragContext>
              <Main/>
            </DragContext>
          </UIProvider>
        </ErrorHandler>
      </ApolloProvider>
    </ThemeProvider>
  </ThemeProvider>;
}
