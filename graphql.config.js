module.exports = {
  projects: {
    allthethings: {
      schema: ["modules/**/*.graphql"],
      documents: [
        "modules/client/**/*.gql",
        "modules/services/*/client/**/*.gql",
      ],
    },
    github: {
      schema: ["https://docs.github.com/public/schema.docs.graphql"],
      documents: ["modules/services/github/server/**/*.gql"],
    },
  },
};
