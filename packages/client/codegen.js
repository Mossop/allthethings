const path = require("path");

module.exports = {
  [path.join(__dirname, "src", "schema", "types.ts")]: {
    plugins: {
      "typescript": {
        immutableTypes: true,
      },
      "typescript-apollo-client-helpers": {
        useTypeImports: true,
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
      "typescript-operations": {
        avoidOptionals: true,
        immutableTypes: true,
        preResolveTypes: true,
        useTypeImports: true,
        onlyOperationTypes: true,
      },
      "typescript-react-apollo": {
        withRefetchFn: true,
      },
      "add": {
        content: [
          "/* eslint-disable */",
        ],
      },
    },
  },
};
