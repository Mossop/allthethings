/* eslint-disable @typescript-eslint/naming-convention */
import { promises as fs } from "fs";
import path from "path";

import type { ValueNode } from "graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { DateTime } from "luxon";

import type { QueryPageContentArgs, TaskController } from "#schema";
import { ServiceManager } from "#server/core";
import type { GraphQLCtx, Problem } from "#server/utils";
import { rootResolvers } from "#server/utils";

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

export default (schemaVersion: string): Resolvers =>
  rootResolvers<Resolvers>({
    DateTime: new GraphQLScalarType({
      name: "DateTime",
      description: "DateTime",
      serialize(value: DateTime): string {
        return value.toISO();
      },
      parseValue(value: unknown): DateTime | null {
        return typeof value == "string"
          ? DateTime.fromISO(value).toUTC()
          : null;
      },
      parseLiteral(ast: ValueNode): DateTime | null {
        if (ast.kind === Kind.STRING) {
          return DateTime.fromISO(ast.value);
        }
        return null;
      },
    }),

    TaskController: new GraphQLScalarType({
      name: "TaskController",
      description: "TaskController",
      serialize(value: TaskController): string {
        return value;
      },
      parseValue(value: unknown): TaskController | null {
        return typeof value == "string" ? (value as TaskController) : null;
      },
      parseLiteral(ast: ValueNode): TaskController | null {
        if (ast.kind === Kind.STRING) {
          return ast.value as TaskController;
        }
        return null;
      },
    }),

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
