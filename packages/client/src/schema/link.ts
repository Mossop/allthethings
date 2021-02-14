import type { FetchResult, NextLink, Operation } from "@apollo/client";
import { ApolloLink } from "@apollo/client";
import { DateTime } from "luxon";
import type Observable from "zen-observable";

/* eslint-disable @typescript-eslint/naming-convention */
const handlers: TypeHandlers = {
  Task: {
    due: parseDateTime,
    done: parseDateTime,
  },
};

interface GraphQLObject {
  __typename: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Handler<T> = (value: any) => T | null;
type TypeHandlers = Record<string, Record<string, Handler<unknown>>>;

function isGraphQLObject(obj: any): obj is GraphQLObject {
  return typeof obj == "object" && typeof obj.__typename == "string";
}

function parseDateTime(value: any): DateTime | null {
  if (!value) {
    return null;
  }

  return DateTime.fromISO(value);
}

function parseObject<T extends GraphQLObject>(obj: T): void {
  if (obj.__typename in handlers) {
    for (let [key, parser] of Object.entries(handlers[obj.__typename])) {
      if (key in obj) {
        obj[key] = parser(obj[key]);
      }
    }
  }

  Object.values(obj).forEach(parseItem);
}

function parseItem(item: unknown): void {
  if (!item) {
    return;
  }

  if (Array.isArray(item)) {
    return item.forEach(parseItem);
  }

  if (isGraphQLObject(item)) {
    return parseObject(item);
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default new ApolloLink(
  (operation: Operation, forward: NextLink): Observable<FetchResult> | null => {
    return forward(operation).map((result: FetchResult): FetchResult => {
      if (result.data) {
        for (let response of Object.values(result.data)) {
          parseItem(response);
        }
      }

      return result;
    });
  },
);