export type Meta = Record<string, unknown>;

export type LogMethod = (message: string, meta?: Meta) => void;
export type LogLevel = "error" | "warn" | "info" | "debug" | "trace";

export type Logger = {
  readonly [K in LogLevel]: LogMethod;
};

export function extendLogger(logger: Logger, meta: Meta): Logger {
  let newLogger = {} as unknown as Logger;

  for (let method of ["error", "warn", "info", "debug", "trace"]) {
    newLogger[method] = (message: string, extraMeta?: Meta): void => {
      logger[method](message, {
        ...meta,
        ...extraMeta,
      });
    };
  }

  return newLogger;
}
