/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

module.exports = {
  overwrite: true,
  schema: [
    require.resolve("@allthethings/schema/schema.graphql"),
    require.resolve("@allthethings/jira-schema/schema.graphql"),
  ],
  errorsOnly: true,
  generates: {
    [path.join(__dirname, "src", "schema.ts")]: {
      documents: path.join(__dirname, "operations.gql"),
      plugins: {
        "typescript": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
          scalars: {
            DateTime: "luxon#DateTime",
          },
        },
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
          content: "/* eslint-disable */",
        },
      },
    },
  },
};
