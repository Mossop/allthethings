import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  link: createHttpLink({
    uri: "/graphql",
    credentials: "same-origin",
  }),
  cache: new InMemoryCache(),
});

export function connect(): ApolloClient<unknown> {
  return client;
}
