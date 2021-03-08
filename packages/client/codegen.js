/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

module.exports = {
  overwrite: true,
  schema: require.resolve("@allthethings/schema/schema.graphql"),
  errorsOnly: true,
  generates: {
    [path.join(__dirname, "src", "schema", "types.ts")]: {
      plugins: {
        "typescript": {
          immutableTypes: true,
          nonOptionalTypename: true,
          preResolveTypes: true,
          useTypeImports: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
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
          nonOptionalTypename: true,
        },
        "typescript-react-apollo": {
          useTypeImports: true,
          withRefetchFn: true,
        },
        "add": {
          content: [
            "/* eslint-disable */",
          ],
        },
      },
    },
  },
};
