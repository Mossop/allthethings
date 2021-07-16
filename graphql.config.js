module.exports = {
  projects: {
    allthethings: {
      schema: [
        "core/schema/**/*",
        "plugins/*/schema/**/*",
      ],
      documents: [
        "core/client/**/*",
        "plugins/*/client/**/*",
      ],
    },
    github: {
      schema: [
        "https://docs.github.com/public/schema.docs.graphql",
      ],
      documents: [
        "plugins/github/server/**/*",
      ],
    },
  },
};
