/* eslint-disable @typescript-eslint/naming-convention */
import { promises as fs } from "fs";
import path from "path";

import type { ValueNode } from "graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { DateTime } from "luxon";

import type {
  DateTimeOffset,
  QueryPageContentArgs,
  TaskController,
} from "#schema";
import { ServiceManager } from "#server/core";
import type { GraphQLCtx, Problem } from "#server/utils";
import { rootResolvers } from "#server/utils";
import type { RelativeDateTime } from "#utils";
import { offsetFromJson, relativeDateTimeFromJson } from "#utils";

import type { Resolvers } from "./schema";

const pageRoot = path.normalize(path.join(__dirname, "..", "..", "pages"));

async function loadFile(name: string): Promise<string | null> {
  try {
    let content = await fs.readFile(name, {
      encoding: "utf8",
    });
    return content;
  } catch (e) {
    return null;
  }
}

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

      async pageContent(
        ctx: GraphQLCtx,
        { path: targetPath }: QueryPageContentArgs,
      ): Promise<string> {
        targetPath = targetPath.substring(1);
        let target: string;
        if (targetPath.length) {
          target = path.join(pageRoot, ...targetPath.split("/"));
        } else {
          target = path.normalize(path.join(pageRoot, "..", "..", "README"));
        }

        let content = await loadFile(target + ".md");
        if (content) {
          return content;
        }

        content = await loadFile(path.join(target, "index.md"));
        if (content) {
          return content;
        }

        throw new Error(`Unknown file: ${target}`);
      },
    },
  });
