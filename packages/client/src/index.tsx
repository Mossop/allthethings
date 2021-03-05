import { render } from "react-dom";

import App from "./App";
import { connect } from "./schema";

function init(): void {
  let client = connect();

  render(
    <App client={client}/>,
    document.getElementById("app"),
  );
}

void init();

export { default as PluginManager } from "./plugins";
export type { ClientPlugin } from "./plugins";
export { SettingSection } from "./ui/Settings";
export { TextFieldInput, RadioGroupInput } from "./components/Forms";
export { useBoolState } from "./utils/hooks";
export * as Apollo from "@apollo/client";
export { default as Error } from "./components/Error";
