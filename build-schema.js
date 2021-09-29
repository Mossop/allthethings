const { promises: fs } = require("fs");
const path = require("path");

const { generateApi } = require("swagger-typescript-api");
const { withDir } = require("tmp-promise");
const { generateSpec, generateRoutes } = require("tsoa");

const SERVICES = [];

let modules = path.resolve(path.join(__dirname, "modules"));

/**
 * @param {string} controller
 * @param {string} pathPrefix
 */
function buildSpec(controller, pathPrefix, mergeWith = {}) {
  return withDir(
    async (dir) => {
      await generateSpec({
        controllerPathGlobs: [controller],
        noImplicitAdditionalProperties: "throw-on-extras",
        outputDirectory: dir.path,
        specFileBaseName: "openapi",
        specVersion: 3,
        spec: mergeWith,
        specMerging: "recursive",
        xEnumVarnames: true,
      });

      let spec = JSON.parse(
        await fs.readFile(path.join(dir.path, "openapi.json")),
      );
      delete spec.servers;
      spec.paths = Object.fromEntries(
        Object.entries(spec.paths).map(([path, api]) => [
          pathPrefix + path,
          api,
        ]),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return spec;
    },
    { unsafeCleanup: true },
  );
}

async function buildRoutes(controller) {
  await generateRoutes({
    controllerPathGlobs: [controller],
    noImplicitAdditionalProperties: "throw-on-extras",
    middleware: "koa",
    noWriteIfUnchanged: true,
    routesDir: path.dirname(controller),
    routesFileName: "routes.ts",
    iocModule: "modules/server/utils",
  });

  let routes = path.join(path.dirname(controller), "routes.ts");
  let content = await fs.readFile(routes, { encoding: "utf-8" });
  await fs.writeFile(
    routes,
    content.replace(/'[./]*\/#server\/utils'/, "'#server/utils'"),
  );
}

async function run() {
  let spec = await buildSpec(
    path.join(modules, "server", "core", "controllers.ts"),
    "/api",
  );

  for (let service of SERVICES) {
    spec = await buildSpec(
      path.join(modules, "services", service, "server", "controllers.ts"),
      `/service/${service}`,
      spec,
    );
  }

  await fs.writeFile(
    path.join(modules, "schema", "openapi.json"),
    JSON.stringify(spec, undefined, "  "),
  );

  for (let service of SERVICES) {
    await buildRoutes(
      path.join(modules, "services", service, "server", "controllers.ts"),
    );
  }
  await buildRoutes(path.join(modules, "server", "core", "controllers.ts"));

  await generateApi({
    name: "client.ts",
    silent: true,
    output: path.join(modules, "client", "utils"),
    input: path.join(modules, "schema", "openapi.json"),
    generateResponses: true,
    httpClientType: "fetch",
    moduleNameIndex: 1,
  });

  let client = path.join(modules, "client", "utils", "client.ts");
  let content = await fs.readFile(client, { encoding: "utf-8" });
  await fs.writeFile(
    client,
    content.replace(
      "Api<SecurityDataType extends unknown>",
      "Api<SecurityDataType extends unknown = unknown>",
    ),
  );
}

run().catch((e) => console.error(e));
