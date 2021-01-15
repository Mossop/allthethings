const path = require("path");

module.exports = {
  [path.join(__dirname, "src", "db", "types.ts")]: {
    plugins: {
      "typescript-mongodb": {
        useTypeImports: true,
        avoidOptionals: true,
        immutableTypes: true,
      },
      "add": {
        content: [
          "/* eslint-disable */",
          "import type { Maybe } from \"../schema/types\";",
        ],
      },
    },
  },
  [path.join(__dirname, "src", "schema", "types.ts")]: {
    plugins: {
      typescript: {
        useIndexSignature: true,
        useTypeImports: true,
        immutableTypes: true,
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
        useIndexSignature: true,
        useTypeImports: true,
        immutableTypes: true,
        namespacedImportName: "Schema",
        mappers: {
          /* eslint-disable @typescript-eslint/naming-convention */
          User: "../db/implementations#User",
          NamedContext: "../db/implementations#NamedContext",
          Project: "../db/implementations#Project",
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
  [path.join(__dirname, "src", "schema", "schema.graphql")]: {
    plugins: [
      "schema-ast",
    ],
  },
};
