/* eslint-disable @typescript-eslint/naming-convention */
import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink } from "@apollo/client";
import { DateTime } from "luxon";

import link from "./link";
import introspection from "./types";
import type { TypedTypePolicies } from "./types";

const ArrayField = {
  merge: (_existing: unknown[] = [], incoming: unknown[]): unknown[] => incoming,
};

const DateField = {
  read: (existing: string) => DateTime.fromISO(existing),
};

const OptionalDateField = {
  read: (existing: string | null | undefined) => existing ? DateTime.fromISO(existing) : null,
};

let typePolicies: TypedTypePolicies = {
  Item: {
    fields: {
      created: DateField,
      archived: OptionalDateField,
      snoozed: OptionalDateField,
    },
  },
  TaskInfo: {
    fields: {
      due: OptionalDateField,
      done: OptionalDateField,
    },
  },
  Inbox: {
    fields: {
      items: ArrayField,
    },
  },
  Section: {
    fields: {
      items: ArrayField,
    },
  },
  Project: {
    fields: {
      subprojects: ArrayField,
      items: ArrayField,
      sections: ArrayField,
    },
  },
  Context: {
    fields: {
      subprojects: ArrayField,
      items: ArrayField,
      sections: ArrayField,
    },
  },
  User: {
    fields: {
      subprojects: ArrayField,
      items: ArrayField,
      sections: ArrayField,
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
  defaultOptions: {
    mutate: {
      awaitRefetchQueries: true,
    },
  },
});

export function connect(): ApolloClient<unknown> {
  return client;
}
