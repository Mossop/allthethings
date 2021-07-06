/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");

module.exports = {
  overwrite: true,
  schema: require.resolve("@allthethings/bugzilla-schema/schema.graphql"),
  errorsOnly: true,
  generates: {
    [path.join(__dirname, "src", "schema.ts")]: {
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
        "typescript-resolvers": {
          useIndexSignature: true,
          useTypeImports: true,
          immutableTypes: true,
          avoidOptionals: true,
        },
        "add": {
          content: "/* eslint-disable */",
        },
      },
    },
  },
};
