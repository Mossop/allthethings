import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import CssBaseline from "@material-ui/core/CssBaseline";
import type { Theme } from "@material-ui/core/styles";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { render } from "react-dom";

import App from "./App";

const baseTheme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

/* eslint-disable @typescript-eslint/naming-convention */
const themeOverrides = (theme: Theme): Theme => createMuiTheme({
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
    // @ts-ignore: Rating is from labs
    MuiRating: {
      root: {
        fontSize: "inherit",
      },
    },
    MuiSvgIcon: {
      root: {
        fontSize: "inherit",
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
        paddingBottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "stretch",
      },
    },
    MuiDialogActions: {
      root: {
        padding: theme.spacing(1),
      },
    },
  },
  props: {
    MuiDialogActions: {
      disableSpacing: true,
    },
  },
});
/* eslint-enable @typescript-eslint/naming-convention */

function init(): void {
  let link = createHttpLink({
    uri: "/graphql",
    credentials: "same-origin",
  });

  let client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });

  render(
    <ThemeProvider theme={baseTheme}>
      <ThemeProvider theme={themeOverrides}>
        <ApolloProvider client={client}>
          <CssBaseline/>
          <App/>
        </ApolloProvider>
      </ThemeProvider>
    </ThemeProvider>,
    document.getElementById("app"),
  );
}

void init();
