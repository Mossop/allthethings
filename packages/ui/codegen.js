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
  },
};