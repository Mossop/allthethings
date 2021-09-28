/* eslint-disable @typescript-eslint/naming-convention */
import type { ValueNode } from "graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { DateTime } from "luxon";

import { ServiceManager } from "#server/core";
import type { GraphQLCtx, Problem } from "#server/utils";
import { rootResolvers } from "#server/utils";
import type { RelativeDateTime } from "#utils";
import { offsetFromJson, relativeDateTimeFromJson } from "#utils";

import type { DateTimeOffset, TaskController } from "../../schema";
import type { Resolvers } from "./schema";

function scalarType<T>(
  name: string,
  serialize: (val: T) => string,
  parse: (val: string) => T,
): GraphQLScalarType {
  return new GraphQLScalarType({
    name,
    description: name,
    serialize,
    parseValue(value: unknown): T | null {
      return typeof value == "string" ? parse(value) : null;
    },
    parseLiteral(ast: ValueNode): T | null {
      if (ast.kind === Kind.STRING) {
        return parse(ast.value);
      }
      return null;
    },
  });
}

export default (schemaVersion: string): Resolvers =>
  rootResolvers<Resolvers>({
    DateTime: scalarType<DateTime>(
      "DateTime",
      (value: DateTime): string => value.toISO(),
      (value: string): DateTime => DateTime.fromISO(value).toUTC(),
    ),

    DateTimeOffset: scalarType<DateTimeOffset>(
      "DateTimeOffset",
      (value: DateTimeOffset): string => JSON.stringify(value),
      (value: string): DateTimeOffset => offsetFromJson(JSON.parse(value)),
    ),

    RelativeDateTime: scalarType<RelativeDateTime>(
      "RelativeDateTime",
      (value: RelativeDateTime): string => JSON.stringify(value),
      (value: string): RelativeDateTime =>
        relativeDateTimeFromJson(JSON.parse(value)),
    ),

    TaskController: scalarType<TaskController>(
      "TaskController",
      (value: TaskController): string => value,
      (value: string): TaskController => value as TaskController,
    ),

    Query: {
      schemaVersion,
      problems(ctx: GraphQLCtx): Promise<Problem[]> {
        return ServiceManager.listProblems(ctx.transaction, ctx.userId);
      },
    },
  });
