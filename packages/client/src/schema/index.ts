import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

export function connect(): ApolloClient<unknown> {
  let link = createHttpLink({
    uri: "/graphql",
    credentials: "same-origin",
  });

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
}
