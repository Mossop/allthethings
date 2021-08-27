/* eslint-disable @typescript-eslint/naming-convention */
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  createHttpLink,
} from "@apollo/client";
import type { ParsingFunctionsObject } from "apollo-link-scalars";
import { withScalars } from "apollo-link-scalars";
import { buildClientSchema } from "graphql";
import { DateTime } from "luxon";

import type { DateTimeOffset } from "#schema";
import { introspectionData } from "#schema";
import type { RelativeDateTime } from "#utils";
import { offsetFromJson, relativeDateTimeFromJson } from "#utils";

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

function scalarType<T>(
  serialize: (value: T) => string,
  parse: (value: string) => T,
): ParsingFunctionsObject<T, string> {
  return {
    serialize,
    parseValue: (raw: string | number | null): T | null => {
      if (typeof raw == "string") {
        return parse(raw);
      }
      return null;
    },
  };
}

let typesMap = {
  DateTime: scalarType<DateTime>(
    (parsed: DateTime) => parsed.toString(),
    (value: string) => DateTime.fromISO(value).toLocal(),
  ),

  DateTimeOffset: scalarType<DateTimeOffset>(
    (value: DateTimeOffset) => JSON.stringify(value),
    (value: string) => offsetFromJson(value),
  ),

  RelativeDateTime: scalarType<RelativeDateTime>(
    (value: RelativeDateTime) => JSON.stringify(value),
    (value: string) => relativeDateTimeFromJson(value),
  ),
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
