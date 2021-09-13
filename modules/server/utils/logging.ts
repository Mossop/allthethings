import util from "util";

import colors from "colors/safe";
import type { TransformableInfo } from "logform";
import { format } from "logform";
import { MESSAGE } from "triple-beam";
import { createLogger, transports } from "winston";

import type { Logger, LogMethod, Meta } from "#utils";

import { segmentEntry } from "./segment";

export type { Logger, LogMethod };

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
  },
  colors: {
    error: colors.red,
    warn: colors.yellow,
    info: colors.bold["white"],
    debug: colors.grey,
    trace: colors.dim["grey"],
  },
};

function filtered(
  obj: Record<string | symbol, unknown>,
): Record<string, unknown> | null {
  let entries = Object.entries(obj).filter(
    ([key]: [string | symbol, unknown]): boolean => typeof key != "symbol",
  );

  if (entries.length) {
    return Object.fromEntries(entries);
  }
  return null;
}

const formatter = format((info: TransformableInfo): TransformableInfo => {
  let { timestamp, level, message, error, ...meta } = info;
  let additional = filtered(meta);

  level = logLevels.colors[level](level.toLocaleUpperCase()).padEnd(5);

  let output = `${timestamp}: ${level} - ${colors.bold["white"](message)}`;
  if (additional) {
    output += `\n${util.inspect(additional, { colors: true })}`;
  }

  if (error) {
    output += `\n${colors.red(error.message)}\n${colors.grey(error.stack)}`;
  }

  // @ts-ignore
  info[MESSAGE] = output;
  return info;
});

function buildLogger(meta: Record<string, unknown> = {}): Logger {
  let winstonLogger = createLogger({
    level: "debug",
    exitOnError: false,
    levels: logLevels.levels,
    transports: [
      new transports.Console({
        format: format.combine(
          format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" }),
          formatter(),
        ),
      }),
    ],
    defaultMeta: meta,
  });

  let logMethod = (level: string): LogMethod => {
    return (message: string, extraMeta: Meta = {}): void => {
      winstonLogger.log(level, message, {
        ...meta,
        ...extraMeta,
      });
    };
  };

  return {
    error: logMethod("error"),
    warn: logMethod("warn"),
    info: logMethod("info"),
    debug: logMethod("debug"),
    trace: logMethod("trace"),
  };
}

export const log = buildLogger();

export const inSegment = segmentEntry(() => log);
