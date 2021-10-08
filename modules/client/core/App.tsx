import AdapterLuxon from "@mui/lab/AdapterLuxon";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
  CssBaseline,
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material";
import type { Theme } from "@mui/material";
import { createSpacing } from "@mui/system";

import type { ReactResult } from "../utils";
import ErrorHandler from "./components/ErrorHandler";
import GlobalPopups from "./components/GlobalPopups";
import Main from "./components/Main";
import { DragContext } from "./utils/drag";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const spacing = createSpacing(8);

const baseTheme = createTheme({
  spacing,
  palette: {
    mode: "dark",
    primary: {
      main: "#CEA07E",
      contrastText: "#000000",
    },
    secondary: {
      main: "#7EACCE",
      contrastText: "#000000",
    },
    background: {
      default: "#303030",
      paper: "#424242",
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        enableColorOnDark: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
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
        html: {
          overflow: "hidden",
        },
        body: {
          cursor: "default",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          minWidth: "22rem",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingLeft: spacing(2),
          paddingRight: spacing(2),
          paddingBottom: spacing(2),
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingLeft: spacing(2),
          paddingRight: spacing(2),
          paddingBottom: spacing(4),
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          alignItems: "stretch",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingTop: spacing(2),
          paddingLeft: spacing(2),
          paddingRight: spacing(2),
          paddingBottom: 0,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        marginNormal: {
          marginTop: spacing(1),
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          fontSize: "inherit",
          color: "inherit",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
  },
});

export default function App(): ReactResult {
  return (
    <StyledEngineProvider injectFirst={true}>
      <ThemeProvider theme={baseTheme}>
        <DragContext>
          <CssBaseline />
          <ErrorHandler>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
              <GlobalPopups>
                <Main />
              </GlobalPopups>
            </LocalizationProvider>
          </ErrorHandler>
        </DragContext>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
