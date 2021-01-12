const path = require("path");

module.exports = {
  [path.join(__dirname, "src", "schema", "types.ts")]: {
    plugins: [
      "typescript",
      "add",
    ],
    config: {
      content: "/* eslint-disable */",
    },
  },
  [path.join(__dirname, "src", "schema")]: {
    documents: path.join(__dirname, "src", "schema", "*.graphql"),
    preset: "near-operation-file",
    presetConfig: {
      baseTypesPath: "types.ts",
      extension: ".ts",
    },
    plugins: [
      "typescript-operations",
      "typescript-react-apollo",
      "add",
    ],
    config: {
      content: "/* eslint-disable */",
      withRefetchFn: true,
    },
  },
};
