import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@material-ui/core/CssBaseline";
import type { Theme } from "@material-ui/core/styles";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { render } from "react-dom";

import App from "./App";
import { connect } from "./schema";
import { StateListener } from "./utils/state";

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
      },
    },
    MuiSvgIcon: {
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
          <DndProvider backend={HTML5Backend}>
            <StateListener>
              <App/>
            </StateListener>
          </DndProvider>
        </ApolloProvider>
      </ThemeProvider>
    </ThemeProvider>,
    document.getElementById("app"),
  );
}

void init();
