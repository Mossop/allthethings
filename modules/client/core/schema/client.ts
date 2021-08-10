/* eslint-disable @typescript-eslint/naming-convention */
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client";
import { withScalars } from "apollo-link-scalars";
import { buildClientSchema } from "graphql";
import { DateTime } from "luxon";

import { introspectionData } from "#schema";

import possibleTypes from "./types";
import type { TypedTypePolicies } from "./types";

const ArrayField = {
  merge: (_existing: unknown[] = [], incoming: unknown[]): unknown[] =>
    incoming,
};

let typePolicies: TypedTypePolicies = {
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

let typesMap = {
  DateTime: {
    serialize: (parsed: DateTime) => parsed.toString(),
    parseValue: (raw: string | number | null): DateTime | null => {
      if (typeof raw == "string") {
        let date = DateTime.fromISO(raw);
        if (date.isValid) {
          return date;
        }
      }
      return null;
    },
  },
};

export const client = new ApolloClient({
  link: ApolloLink.from([
    withScalars({
      schema: buildClientSchema(introspectionData),
      typesMap,
    }),
    createHttpLink({
      uri: "/graphql",
      credentials: "same-origin",
    }),
  ]),
  cache: new InMemoryCache({
    ...possibleTypes,
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
