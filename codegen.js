module.exports = {
  overwrite: true,
  schema: "./schema/schema.graphql",
  generates: {
    ...require("./packages/server/codegen"),
    ...require("./packages/client/codegen"),
  },
};
