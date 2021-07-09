import { render } from "react-dom";

import { PluginManager } from "#client-utils";

import App from "./App";
import { client } from "./schema";

async function init(): Promise<void> {
  await PluginManager.registerPlugin((await import("#plugins/bugzilla/client")).default);
  await PluginManager.registerPlugin((await import("#plugins/google/client")).default);
  await PluginManager.registerPlugin((await import("#plugins/jira/client")).default);
  await PluginManager.registerPlugin((await import("#plugins/phabricator/client")).default);

  render(
    <App client={client}/>,
    document.getElementById("app"),
  );
}

void init();
