import CssBaseline from "@material-ui/core/CssBaseline";
import type { Theme } from "@material-ui/core/styles";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { render } from "react-dom";

const baseTheme = createMuiTheme();

/* eslint-disable @typescript-eslint/naming-convention */
const themeOverrides = (theme: Theme): Theme => createMuiTheme({
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
  render(
    <ThemeProvider theme={baseTheme}>
      <ThemeProvider theme={themeOverrides}>
        <CssBaseline/>
      </ThemeProvider>
    </ThemeProvider>,
    document.getElementById("app"),
  );
}

void init();
