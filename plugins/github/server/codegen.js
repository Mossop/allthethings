const path = require("path");

module.exports = {
  [path.join(__dirname, "operations.ts")]: {
    schema: "https://docs.github.com/public/schema.docs.graphql",
    documents: path.join(__dirname, "*.gql"),

    plugins: {
      "typescript": {
        immutableTypes: true,
        avoidOptionals: true,
        nonOptionalTypename: true,
        preResolveTypes: true,
        useTypeImports: true,
        useIndexTypes: true,
        defaultScalarType: "string",
      },
      "typescript-operations": {
        avoidOptionals: true,
        immutableTypes: true,
        preResolveTypes: true,
        useTypeImports: true,
        onlyOperationTypes: true,
        nonOptionalTypename: true,
        defaultScalarType: "string",
        skipTypename: true,
      },
      "typescript-document-nodes": {
        documentMode: "string",
        defaultScalarType: "string",
        useTypeImports: true,
        nameSuffix: "Query",
        namingConvention: "camelCase",
      },
      "add": {
        content: [
          "/* eslint-disable */",
        ],
      },
    },
  },
};
