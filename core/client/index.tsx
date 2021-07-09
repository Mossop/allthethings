import { render } from "react-dom";

import { PluginManager } from "#ui";

async function init(): Promise<void> {
  await PluginManager.registerPlugin((await import("#plugins/bugzilla/client")).default);
  await PluginManager.registerPlugin((await import("#plugins/google/client")).default);
  await PluginManager.registerPlugin((await import("#plugins/jira/client")).default);
  await PluginManager.registerPlugin((await import("#plugins/phabricator/client")).default);

  let { client } = await import("./schema");
  let { default: App } = await import("./App");

  render(
    <App client={client}/>,
    document.getElementById("app"),
  );
}

void init();
