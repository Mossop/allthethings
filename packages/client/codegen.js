const path = require("path");

module.exports = {
  [path.join(__dirname, "src", "schema", "types.ts")]: {
    documents: path.join(__dirname, "src", "schema", "*.graphql"),
    plugins: [
      "typescript",
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
