import { render } from "react-dom";

import BugzillaPlugin from "#plugins/bugzilla/client";
import GooglePlugin from "#plugins/google/client";
import JiraPlugin from "#plugins/jira/client";
import PhabricatorPlugin from "#plugins/phabricator/client";
import { PluginManager } from "#ui";

import App from "./App";
import { connect } from "./schema";

async function init(): Promise<void> {
  let client = connect();
  await PluginManager.registerPlugin(BugzillaPlugin);
  await PluginManager.registerPlugin(GooglePlugin);
  await PluginManager.registerPlugin(JiraPlugin);
  await PluginManager.registerPlugin(PhabricatorPlugin);

  render(
    <App client={client}/>,
    document.getElementById("app"),
  );
}

void init();
