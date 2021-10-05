/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

const rootDir = path.join(__dirname, "modules");

const scalars = {
  DateTime: "luxon#DateTime",
  TaskController: "./types#TaskController",
  DateTimeOffset: "./types#DateTimeOffset",
  RelativeDateTime: "./types#RelativeDateTime",
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

    ...require("./modules/services/github/server/codegen"),
  },
};
