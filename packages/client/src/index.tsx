import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@material-ui/core/CssBaseline";
import type { Theme } from "@material-ui/core/styles";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { render } from "react-dom";

import App from "./App";
import { connect } from "./schema";
import { StateListener } from "./utils/state";

const base = createMuiTheme();

/* eslint-disable @typescript-eslint/naming-convention */
const baseTheme = (theme: Theme): Theme => createMuiTheme({
  palette: {
    type: "dark",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        "*": {
          fontWeight: "inherit",
          fontSize: "inherit",
          padding: 0,
          margin: 0,
          color: "inherit",
          cursor: "inherit",
        },
        "body": {
          cursor: "default",
        },
      },
    },
    MuiSvgIcon: {
      root: {
        fontSize: "inherit",
      },
    },
    MuiIconButton: {
      root: {
        fontSize: "inherit",
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

function init(): void {
  let client = connect();

  render(
    <ThemeProvider theme={base}>
      <ThemeProvider theme={baseTheme}>
        <ApolloProvider client={client}>
          <CssBaseline/>
          <StateListener>
            <App/>
          </StateListener>
        </ApolloProvider>
      </ThemeProvider>
    </ThemeProvider>,
    document.getElementById("app"),
  );
}

void init();
