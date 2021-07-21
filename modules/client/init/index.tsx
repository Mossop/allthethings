import { render } from "react-dom";

import { App } from "#client/core";
import { ServiceManager } from "#client/utils";

async function init(): Promise<void> {
  await ServiceManager.registerService((await import("#services/bugzilla/client")).default);
  await ServiceManager.registerService((await import("#services/github/client")).default);
  await ServiceManager.registerService((await import("#services/google/client")).default);
  await ServiceManager.registerService((await import("#services/jira/client")).default);
  await ServiceManager.registerService((await import("#services/phabricator/client")).default);

  render(
    <App/>,
    document.getElementById("app"),
  );
}

void init();
