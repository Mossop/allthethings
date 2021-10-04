/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

const rootDir = path.join(__dirname, "modules");

const scalars = {
  DateTime: "luxon#DateTime",
  TaskController: "./types#TaskController",
  DateTimeOffset: "./types#DateTimeOffset",
  RelativeDateTime: "./types#RelativeDateTime",
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
      Object.keys(scalars).map((key) => [key, `Schema.Scalars['${key}']`]),
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
  add: {
    content: [
      "/* eslint-disable */",
      "import * as Schema from '../../../schema';",
    ],
  },
};

const resolverPlugins = (schemaPath, mappers = {}) => ({
  "typescript-resolvers": {
    useIndexSignature: false,
    useTypeImports: true,
    immutableTypes: true,
    avoidOptionals: true,
    namespacedImportName: "Schema",
    rootValueType: "Schema.Root",
    mappers,
    noSchemaStitching: true,
  },
  add: {
    content: [
      "/* eslint-disable */",
      `import * as Schema from '${schemaPath}';`,
    ],
  },
});

const serviceTargets = (service, mappers = {}) => ({
  [path.join(rootDir, "services", service, "client", "operations.ts")]: {
    schema: [path.join(rootDir, "**", "*.graphql")],
    documents: path.join(rootDir, "services", service, "client", "*.gql"),
    plugins: clientOperationPlugins,
  },

  [path.join(rootDir, "services", service, "server", "schema.ts")]: {
    schema: [
      path.join(rootDir, "schema", "scalars.graphql"),
      path.join(rootDir, "services", service, "schema", "schema.graphql"),
    ],
    plugins: resolverPlugins("../../../schema", mappers),
  },
});

module.exports = {
  overwrite: true,
  errorsOnly: true,

  hooks: {
    afterOneFileWrite: "prettier --write",
  },

  generates: {
    [path.join(rootDir, "schema", "introspection.json")]: {
      schema: [path.join(rootDir, "**", "*.graphql")],

      plugins: {
        introspection: {
          minify: true,
        },
      },
    },

    [path.join(rootDir, "schema", "schema.ts")]: {
      schema: [path.join(rootDir, "**", "*.graphql")],

      plugins: {
        typescript: {
          immutableTypes: true,
          nonOptionalTypename: true,
          preResolveTypes: true,
          useTypeImports: true,
          useIndexTypes: true,
          useImplementingTypes: true,
          scalars,
        },
        add: {
          content: ["/* eslint-disable */"],
        },
      },
    },

    [path.join(__dirname, "dist", "schema", "schema.graphql")]: {
      schema: [path.join(rootDir, "**", "*.graphql")],

      plugins: {
        "schema-ast": {},
      },
    },

    [path.join(rootDir, "client", "core", "schema", "types.ts")]: {
      schema: [path.join(rootDir, "**", "*.graphql")],

      plugins: {
        "typescript-apollo-client-helpers": {
          useTypeImports: true,
        },
        "fragment-matcher": {},
        add: {
          content: ["/* eslint-disable */"],
        },
      },
    },

    [path.join(rootDir, "server", "init", "schema.ts")]: {
      schema: [
        path.join(rootDir, "schema", "scalars.graphql"),
        path.join(rootDir, "server", "init", "schema.graphql"),
      ],

      plugins: {
        ...resolverPlugins("../../schema"),
      },
    },

    [path.join(rootDir, "server", "core", "schema.ts")]: {
      schema: [
        path.join(rootDir, "schema", "scalars.graphql"),
        path.join(rootDir, "server", "core", "schema.graphql"),
      ],

      plugins: {
        ...resolverPlugins("../../schema", {
          User: "./implementations#User",
        }),
      },
    },

    ...serviceTargets("github", {
      GithubAccount: "./implementations#Account",
      GithubSearch: "./implementations#Search",
    }),

    ...serviceTargets("jira", {
      JiraAccount: "./implementations#Account",
      JiraSearch: "./implementations#Search",
    }),

    ...serviceTargets("phabricator", {
      PhabricatorAccount: "./implementations#Account",
      PhabricatorQuery: "./implementations#QueryClass",
    }),

    ...require("./modules/services/github/server/codegen"),
  },
};
