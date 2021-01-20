/* eslint-disable @typescript-eslint/naming-convention */
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

import type { TypedTypePolicies } from "./types";

let typePolicies: TypedTypePolicies = {
  Project: {
    fields: {
      subprojects: {
        merge: (_existing: unknown[] = [], incoming: unknown[]): unknown[] => incoming,
      },
    },
  },
  NamedContext: {
    fields: {
      subprojects: {
        merge: (_existing: unknown[] = [], incoming: unknown[]): unknown[] => incoming,
      },
    },
  },
  User: {
    fields: {
      subprojects: {
        merge: (_existing: unknown[] = [], incoming: unknown[]): unknown[] => incoming,
      },
    },
  },
};

export const client = new ApolloClient({
  link: createHttpLink({
    uri: "/graphql",
    credentials: "same-origin",
  }),
  cache: new InMemoryCache({
    typePolicies,
  }),
});

export function connect(): ApolloClient<unknown> {
  return client;
}
