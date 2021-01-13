import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

import type { TypedTypePolicies } from "./types";

export function connect(): ApolloClient<unknown> {
  let typePolicies: TypedTypePolicies = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    User: {
      keyFields: ["email"],
    },
  };

  let link = createHttpLink({
    uri: "/graphql",
    credentials: "same-origin",
  });

  return new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies,
    }),
  });
}
