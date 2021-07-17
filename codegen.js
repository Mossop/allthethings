/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

let customResolverFn = "Promise<TResult> | " +
  "TResult | " +
  "((parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) " +
    "=> Promise<TResult> | TResult)";

const plugins = [
  "bugzilla",
  "google",
  "jira",
  "phabricator",
  "github",
];

const scalars = {
  DateTime: "luxon#DateTime",
  TaskController: "./types#TaskController",
};

const clientOperationPlugins = {
  "typescript-operations": {
    avoidOptionals: true,
    immutableTypes: true,
    preResolveTypes: true,
    useTypeImports: true,
    onlyOperationTypes: true,
    nonOptionalTypename: true,
    namespacedImportName: "Schema",
    scalars: Object.fromEntries(
      Object.keys(scalars).map(key => [key, `Schema.Scalars['${key}']`]),
    ),
  },
  "named-operations-object": {
    identifierName: "OperationNames",
  },
  "typescript-react-apollo": {
    useTypeImports: true,
    withRefetchFn: true,
    namespacedImportName: "Schema",
  },
  "add": {
    content: [
      "/* eslint-disable */",
      "import * as Schema from '#schema';",
    ],
  },
};

const resolverPlugins = (mappers = {}) => ({
  "typescript-resolvers": {
    useIndexSignature: false,
    useTypeImports: true,
    immutableTypes: true,
    avoidOptionals: true,
    namespacedImportName: "Schema",
    customResolverFn,
    mappers: {
      User: "User",
      ...mappers,
    },
    noSchemaStitching: true,
  },
  "add": {
    content: [
      "/* eslint-disable */",
      "import * as Schema from '#schema';",
      "import { User } from '#server-utils';",
    ],
  },
});

const pluginTargets = (plugin, mappers = {}) => ({
  [path.join(__dirname, "plugins", plugin, "client", "operations.ts")]: {
    schema: [
      path.join(__dirname, "core", "schema", "schema.graphql"),
      path.join(__dirname, "plugins", plugin, "schema", "schema.graphql"),
    ],
    documents: path.join(__dirname, "plugins", plugin, "client", "*.gql"),
    plugins: clientOperationPlugins,
  },

  [path.join(__dirname, "plugins", plugin, "server", "schema.ts")]: {
    schema: [
      path.join(__dirname, "plugins", plugin, "schema", "schema.graphql"),
    ],
    plugins: resolverPlugins(mappers),
  },
});

module.exports = {
  overwrite: true,
  errorsOnly: true,

  generates: {
    [path.join(__dirname, "core", "schema", "introspection.json")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        ...plugins.map(
          plugin => path.join(__dirname, "plugins", plugin, "schema", "schema.graphql"),
        ),
      ],

      plugins: {
        introspection: {
          minify: true,
        },
      },
    },

    [path.join(__dirname, "core", "schema", "schema.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        ...plugins.map(
          plugin => path.join(__dirname, "plugins", plugin, "schema", "schema.graphql"),
        ),
      ],

      plugins: {
        typescript: {
          immutableTypes: true,
          avoidOptionals: true,
          nonOptionalTypename: true,
          preResolveTypes: true,
          useTypeImports: true,
          useIndexTypes: true,
          scalars,
        },
        add: {
          content: [
            "/* eslint-disable */",
          ],
        },
      },
    },

    [path.join(__dirname, "dist", "core", "schema", "schema.graphql")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        ...plugins.map(
          plugin => path.join(__dirname, "plugins", plugin, "schema", "schema.graphql"),
        ),
      ],

      plugins: {
        "schema-ast": {},
      },
    },

    [path.join(__dirname, "core", "client", "schema", "types.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
        ...plugins.map(
          plugin => path.join(__dirname, "plugins", plugin, "schema", "schema.graphql"),
        ),
      ],

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

    [path.join(__dirname, "core", "client", "schema", "operations.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
      ],

      documents: path.join(__dirname, "core", "client", "schema", "*.gql"),
      plugins: clientOperationPlugins,
    },

    [path.join(__dirname, "core", "server", "schema", "resolvers.ts")]: {
      schema: [
        path.join(__dirname, "core", "schema", "schema.graphql"),
      ],

      plugins: {
        "typescript-resolvers": {
          contextType: "./context#ResolverContext",
          useIndexSignature: false,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          namespacedImportName: "Schema",
          noSchemaStitching: true,
          customResolverFn: "ResolverFunc<TResult, TParent, TContext, TArgs>",
          rootValueType: "Root",
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
            "import { Root, ResolverFunc } from './types'",
          ],
        },
      },
    },

    ...pluginTargets("bugzilla", {
      BugzillaAccount: "./db/implementations#Account",
      BugzillaSearch: "./db/implementations#Search",
    }),

    ...pluginTargets("google", {
      GoogleAccount: "./db/implementations#Account",
      GoogleMailSearch: "./db/implementations#MailSearch",
    }),

    ...pluginTargets("jira", {
      JiraAccount: "./db/implementations#Account",
      JiraSearch: "./db/implementations#Search",
    }),

    ...pluginTargets("phabricator", {
      PhabricatorAccount: "./db/implementations#Account",
      PhabricatorQuery: "./db/implementations#QueryClass",
    }),

    ...pluginTargets("github", {
      GithubAccount: "./db/implementations#Account",
      GithubSearch: "./db/implementations#Search",
    }),

    ...require("./plugins/github/server/codegen"),
  },
};
