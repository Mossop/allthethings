module.exports = {
  projects: {
    allthethings: {
      schema: [
        "core/schema/*.graphql",
        "plugins/*/schema/*.graphql",
      ],
      documents: [
        "core/**/*.gql",
        "plugins/*/client/*.gql",
      ],
    },
    github: {
      schema: [
        "https://docs.github.com/public/schema.docs.graphql",
      ],
      documents: [
        "plugins/github/server/*.gql",
      ],
    },
  },
};
