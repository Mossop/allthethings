/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

module.exports = {
  overwrite: true,
  schema: path.join(__dirname, "core", "schema", "schema.graphql"),
  errorsOnly: true,
  generates: {
    [path.join(__dirname, "core", "client", "schema", "types.ts")]: {
      plugins: {
        "typescript": {
          immutableTypes: true,
          nonOptionalTypename: true,
          preResolveTypes: true,
          useTypeImports: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-apollo-client-helpers": {
          useTypeImports: true,
        },
        "fragment-matcher": {
        },
        "add": {
          content: [
            "/* eslint-disable */",
          ],
        },
      },
    },
    [path.join(__dirname, "core", "client", "schema")]: {
      documents: path.join(__dirname, "core", "client", "schema", "*.gql"),
      preset: "near-operation-file",
      presetConfig: {
        baseTypesPath: "./types",
        extension: ".ts",
      },
      plugins: {
        "typescript-operations": {
          avoidOptionals: true,
          immutableTypes: true,
          preResolveTypes: true,
          useTypeImports: true,
          onlyOperationTypes: true,
          nonOptionalTypename: true,
          scalars: {
            DateTime: "Types.Scalars['DateTime']",
          },
        },
        "typescript-react-apollo": {
          useTypeImports: true,
          withRefetchFn: true,
        },
        "add": {
          content: [
            "/* eslint-disable */",
          ],
        },
      },
    },

    [path.join(__dirname, "core", "server", "schema", "types.ts")]: {
      plugins: {
        typescript: {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        add: {
          content: "/* eslint-disable */",
        },
      },
    },
    [path.join(__dirname, "core", "server", "schema", "resolvers.ts")]: {
      plugins: {
        "typescript-resolvers": {
          contextType: "./context#ResolverContext",
          useIndexSignature: false,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          namespacedImportName: "Schema",
          mappers: {
          /* eslint-disable @typescript-eslint/naming-convention */
            User: "../db/implementations#User",
            Context: "../db/implementations#Context",
            Project: "../db/implementations#Project",
            Section: "../db/implementations#Section",
            TaskList: "../db/implementations#TaskList",
            Item: "../db/implementations#Item",
            TaskInfo: "../db/implementations#TaskInfo",
            LinkDetail: "../db/implementations#LinkDetail",
            FileDetail: "../db/implementations#FileDetail",
            NoteDetail: "../db/implementations#NoteDetail",
            PluginDetail: "../db/implementations#PluginDetail",
            PluginList: "../db/implementations#PluginList",
            ItemSet: "../db/datasources#ItemSet",
          /* eslint-enable @typescript-eslint/naming-convention */
          },
        },
        "add": {
          content: [
            "/* eslint-disable */",
            "import * as Schema from './types';",
          ],
        },
      },
    },
  },
};
