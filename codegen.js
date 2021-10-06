/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  overwrite: true,
  errorsOnly: true,

  hooks: {
    afterOneFileWrite: "prettier --write",
  },

  generates: {
    ...require("./modules/services/github/server/codegen"),
  },
};
