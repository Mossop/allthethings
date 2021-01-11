const path = require("path");

module.exports = {
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
    },
  },
  [path.join(__dirname, "src", "schema", "schema.graphql")]: {
    plugins: [
      "schema-ast",
    ],
  },
};
