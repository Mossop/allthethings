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
