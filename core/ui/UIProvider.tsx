import LuxonUtils from "@date-io/luxon";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

import type { ReactChildren, ReactResult } from "./types";
import { ReactMemo } from "./types";

export const UIProvider = ReactMemo(function UIProvider({
  children,
}: ReactChildren): ReactResult {
  return <MuiPickersUtilsProvider utils={LuxonUtils}>
    {children}
  </MuiPickersUtilsProvider>;
});
