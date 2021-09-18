import type { Logger, LogLevel, LogMethod, Meta } from "#utils";

function logMethod(level: LogLevel): LogMethod {
  return (message: string | Error, meta: Meta = {}): void => {
    // eslint-disable-next-line no-console
    console[level](level, message, {
      ...meta,
    });
  };
}

export const log: Logger = {
  error: logMethod("error"),
  warn: logMethod("warn"),
  info: logMethod("info"),
  debug: logMethod("debug"),
  trace: logMethod("trace"),
};
