/* eslint-disable @typescript-eslint/naming-convention */
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

import type { TypedTypePolicies } from "./types";

const merge = (_existing: unknown[] = [], incoming: unknown[]): unknown[] => incoming;

let typePolicies: TypedTypePolicies = {
  Project: {
    fields: {
      subprojects: {
        merge,
      },
      items: {
        merge,
      },
      sections: {
        merge,
      },
    },
  },
  Context: {
    fields: {
      subprojects: {
        merge,
      },
      items: {
        merge,
      },
      sections: {
        merge,
      },
    },
  },
  User: {
    fields: {
      subprojects: {
        merge,
      },
      items: {
        merge,
      },
      sections: {
        merge,
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
