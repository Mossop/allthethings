const path = require("path");

module.exports = {
  [path.join(__dirname, "src", "db", "types.ts")]: {
    plugins: [
      "typescript",
      "typescript-mongodb",
      "add",
    ],
    config: {
      content: "/* eslint-disable */",
      useTypeImports: true,
      avoidOptionals: true,
    },
  },
  [path.join(__dirname, "src", "schema", "types.ts")]: {
    plugins: [
      "typescript",
      "typescript-resolvers",
      "add",
    ],
    config: {
      content: "/* eslint-disable */",
      useTypeImports: true,
      contextType: "./context#ResolverContext",
      useIndexSignature: true,
      mappers: {
        /* eslint-disable @typescript-eslint/naming-convention */
        User: "../db/types#UserDbObject",
        EmptyContext: "../db/types#ContextDbObject",
        Context: "../db/types#ContextDbObject",
        Project: "../db/types#ProjectDbObject",
        /* eslint-enable @typescript-eslint/naming-convention */
      },
    },
  },
  [path.join(__dirname, "src", "schema", "schema.graphql")]: {
    plugins: [
      "schema-ast",
    ],
  },
};
