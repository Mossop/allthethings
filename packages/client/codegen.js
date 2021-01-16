const path = require("path");

module.exports = {
  [path.join(__dirname, "src", "schema", "types.ts")]: {
    plugins: {
      typescript: {},
      add: {
        content: [
          "/* eslint-disable */",
        ],
      },
    },
  },
  [path.join(__dirname, "src", "schema", "operations.ts")]: {
    documents: path.join(__dirname, "src", "schema", "*.graphql"),
    preset: "import-types",
    presetConfig: {
      typesPath: "./types",
    },
    plugins: {
      "typescript-operations": {
        avoidOptionals: true,
        immutableTypes: true,
        preResolveTypes: true,
        useTypeImports: true,
        onlyOperationTypes: true,
      },
      "typed-document-node": {
        documentVariableSuffix: "",
      },
      "add": {
        content: [
          "/* eslint-disable */",
        ],
      },
    },
  },
  [path.join(__dirname, "src", "schema")]: {
    documents: path.join(__dirname, "src", "schema", "*.graphql"),
    preset: "near-operation-file",
    presetConfig: {
      baseTypesPath: "./types",
      extension: ".ts",
    },
    plugins: {
      "typescript-react-apollo": {
        withRefetchFn: true,
        documentMode: "external",
        importDocumentNodeExternallyFrom: "./operations",
        importOperationTypesFrom: "Operations",
      },
      "add": {
        content: [
          "/* eslint-disable */",
        ],
      },
    },
  },
};
