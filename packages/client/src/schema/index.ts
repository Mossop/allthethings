/* eslint-disable @typescript-eslint/naming-convention */
import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink } from "@apollo/client";

import link from "./link";
import introspection from "./types";
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
  link: ApolloLink.from([
    link,
    createHttpLink({
      uri: "/graphql",
      credentials: "same-origin",
    }),
  ]),
  cache: new InMemoryCache({
    ...introspection,
    typePolicies,
  }),
});

export function connect(): ApolloClient<unknown> {
  return client;
}
