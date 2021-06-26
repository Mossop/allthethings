/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

module.exports = {
  overwrite: true,
  schema: require.resolve("@allthethings/schema/schema.graphql"),
  errorsOnly: true,
  generates: {
    [path.join(__dirname, "src", "schema", "types.ts")]: {
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
    [path.join(__dirname, "src", "schema", "resolvers.ts")]: {
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
            ProjectRoot: "../db/implementations#ProjectRoot",
            Inbox: "../db/implementations#Inbox",
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
