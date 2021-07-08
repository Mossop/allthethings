/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

module.exports = {
  overwrite: true,
  schema: path.join(__dirname, "core", "schema", "schema.graphql"),
  errorsOnly: true,
  generates: {
    [path.join(__dirname, "core", "schema", "introspection.json")]: {
      plugins: {
        introspection: {
          minify: true,
        },
      },
    },

    [path.join(__dirname, "core", "schema", "schema.ts")]: {
      plugins: {
        typescript: {
          immutableTypes: true,
          avoidOptionals: true,
          nonOptionalTypename: true,
          preResolveTypes: true,
          useTypeImports: true,
          useIndexTypes: true,
          scalars: {
            DateTime: "luxon#DateTime",
            TaskController: "./types#TaskController",
          },
        },
        add: {
          content: [
            "/* eslint-disable */",
          ],
        },
      },
    },

    [path.join(__dirname, "dist", "core", "schema", "schema.graphql")]: {
      plugins: {
        "schema-ast": {},
      },
    },

    [path.join(__dirname, "core", "client", "schema", "types.ts")]: {
      documents: path.join(__dirname, "core", "client", "schema", "*.gql"),
      plugins: {
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
        baseTypesPath: "~#schema",
        extension: ".ts",
        importTypesNamespace: "Schema",
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
            DateTime: "Schema.Scalars['DateTime']",
            TaskController: "Schema.Scalars['TaskController']",
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
            Problem: "Problem",
          },
        },
        "add": {
          content: [
            "/* eslint-disable */",
            "import * as Schema from '#schema';",
            "import { Problem } from '#server-utils'",
          ],
        },
      },
    },

    [path.join(__dirname, "dist", "plugins", "bugzilla", "schema", "schema.graphql")]: {
      schema: path.join(__dirname, "plugins", "bugzilla", "schema", "schema.graphql"),
      plugins: {
        "schema-ast": {},
      },
    },
    [path.join(__dirname, "plugins", "bugzilla", "client", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        path.join(__dirname, "plugins", "bugzilla", "schema", "schema.graphql"),
      ],
      documents: path.join(__dirname, "plugins", "bugzilla", "client", "operations.gql"),
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-operations": {
          avoidOptionals: true,
          immutableTypes: true,
          preResolveTypes: true,
          useTypeImports: true,
          onlyOperationTypes: true,
          nonOptionalTypename: true,
        },
        "typescript-react-apollo": {
          useTypeImports: true,
          withRefetchFn: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },
    [path.join(__dirname, "plugins", "bugzilla", "server", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        path.join(__dirname, "plugins", "bugzilla", "schema", "schema.graphql"),
      ],
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-resolvers": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },

    [path.join(__dirname, "dist", "plugins", "google", "schema", "schema.graphql")]: {
      schema: path.join(__dirname, "plugins", "google", "schema", "schema.graphql"),
      plugins: {
        "schema-ast": {},
      },
    },
    [path.join(__dirname, "plugins", "google", "client", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        path.join(__dirname, "plugins", "google", "schema", "schema.graphql"),
      ],
      documents: path.join(__dirname, "plugins", "google", "client", "operations.gql"),
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-operations": {
          avoidOptionals: true,
          immutableTypes: true,
          preResolveTypes: true,
          useTypeImports: true,
          onlyOperationTypes: true,
          nonOptionalTypename: true,
        },
        "typescript-react-apollo": {
          useTypeImports: true,
          withRefetchFn: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },
    [path.join(__dirname, "plugins", "google", "server", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        path.join(__dirname, "plugins", "google", "schema", "schema.graphql"),
      ],
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-resolvers": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },

    [path.join(__dirname, "dist", "plugins", "jira", "schema", "schema.graphql")]: {
      schema: path.join(__dirname, "plugins", "jira", "schema", "schema.graphql"),
      plugins: {
        "schema-ast": {},
      },
    },
    [path.join(__dirname, "plugins", "jira", "client", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        path.join(__dirname, "plugins", "jira", "schema", "schema.graphql"),
      ],
      documents: path.join(__dirname, "plugins", "jira", "client", "operations.gql"),
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-operations": {
          avoidOptionals: true,
          immutableTypes: true,
          preResolveTypes: true,
          useTypeImports: true,
          onlyOperationTypes: true,
          nonOptionalTypename: true,
        },
        "typescript-react-apollo": {
          useTypeImports: true,
          withRefetchFn: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },
    [path.join(__dirname, "plugins", "jira", "server", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        path.join(__dirname, "plugins", "jira", "schema", "schema.graphql"),
      ],
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-resolvers": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },

    [path.join(__dirname, "dist", "plugins", "phabricator", "schema", "schema.graphql")]: {
      schema: path.join(__dirname, "plugins", "phabricator", "schema", "schema.graphql"),
      plugins: {
        "schema-ast": {},
      },
    },
    [path.join(__dirname, "plugins", "phabricator", "client", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        path.join(__dirname, "plugins", "phabricator", "schema", "schema.graphql"),
      ],
      documents: path.join(__dirname, "plugins", "phabricator", "client", "operations.gql"),
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-operations": {
          avoidOptionals: true,
          immutableTypes: true,
          preResolveTypes: true,
          useTypeImports: true,
          onlyOperationTypes: true,
          nonOptionalTypename: true,
        },
        "typescript-react-apollo": {
          useTypeImports: true,
          withRefetchFn: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },
    [path.join(__dirname, "plugins", "phabricator", "server", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        path.join(__dirname, "plugins", "phabricator", "schema", "schema.graphql"),
      ],
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
        "typescript-resolvers": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },
  },
};
