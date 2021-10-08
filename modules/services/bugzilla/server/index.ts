import type * as KoaRouter from "@koa/router";

import type { ServiceExport, Server } from "../../../server/utils";
import { BaseService } from "../../../server/utils";
import { BugUpdater } from "./implementations";
import { RegisterRoutes } from "./routes";

class BugzillaService extends BaseService {
  protected itemUpdaters = [BugUpdater];

  public addWebRoutes(router: KoaRouter): void {
    RegisterRoutes(router);
  }
}

const serviceExport: ServiceExport = {
  id: "bugzilla",

  init: (server: Server) => new BugzillaService(server),
};

export default serviceExport;
