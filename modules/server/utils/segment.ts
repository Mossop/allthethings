import { performance } from "perf_hooks";

import type { Logger, LogMethod, Meta } from "#utils";

const MAX_SEGMENT_LENGTH = 1000;

function logMethod(level: string): LogMethod {
  return function (this: Segment, message: string, meta: Meta = {}): void {
    this.logger[level](message, {
      ...this.meta,
      ...meta,
      id: this.id,
      name: this.name,
      parent: this.parent?.id,
      depth: this.depth,
      mark: Math.round(performance.now() - this.start),
    });
  };
}

type Operation<T> = (segment: Segment) => Promise<T>;

async function runSegmentOperation<T>(
  segment: Segment,
  operation: Operation<T>,
): Promise<T> {
  try {
    let result = await operation(segment);
    segment.finish();
    return result;
  } catch (error) {
    segment.error(error.message, { error });
    segment.finish();
    throw error;
  }
}

export class Segment implements Logger {
  protected readonly id: number;
  protected closed = false;
  protected currentChild: Segment | null = null;
  protected readonly children: Segment[] = [];
  protected readonly depth: number;
  protected readonly start = performance.now();
  protected loggedSlow = false;

  protected static nextSegmentID = 0;

  public constructor(
    protected readonly parent: Segment | null,
    protected readonly name: string,
    protected readonly logger: Logger,
    protected readonly meta: Meta = {},
  ) {
    this.id = Segment.nextSegmentID++;
    this.depth = parent ? parent.depth + 1 : 0;

    this.trace("Entering segment");
  }

  public readonly error = logMethod("error");
  public readonly warn = logMethod("warn");
  public readonly info = logMethod("info");
  public readonly debug = logMethod("debug");
  public readonly trace = logMethod("trace");

  public get current(): Segment {
    return this.currentChild?.current ?? this;
  }

  public inSegment<T>(name: string, operation: Operation<T>): Promise<T>;
  public inSegment<T>(
    name: string,
    meta: Meta,
    operation: Operation<T>,
  ): Promise<T>;
  public inSegment<T>(
    name: string,
    ...args: [Operation<T>] | [Meta, Operation<T>]
  ): Promise<T> {
    let meta = args.length == 2 ? args[0] : {};
    let operation = args.length == 2 ? args[1] : args[0];

    let segment = this.enterSegment(name, meta);
    return runSegmentOperation(segment, operation);
  }

  public enterSegment(name: string, meta: Meta): Segment {
    if (this.currentChild) {
      this.error(
        `Entering new segment while ${this.currentChild.id} is still open.`,
      );
    }

    this.currentChild = new Segment(this, name, this.logger, meta);
    this.children.push(this.currentChild);
    return this.currentChild;
  }

  public finish(): void {
    if (this.closed) {
      this.error("Double close");
      return;
    }

    if (
      this.currentChild ||
      !this.children.every((child: Segment): boolean => child.closed)
    ) {
      this.error("Closing before all children were closed.");
    }

    this.closed = true;
    if (this.parent && this.parent.currentChild === this) {
      this.parent.currentChild = null;
    }

    if (!this.loggedSlow) {
      let length = performance.now() - this.start;
      if (length >= MAX_SEGMENT_LENGTH) {
        let parents: string[] = [];
        let parent = this.parent;
        while (parent) {
          parent.loggedSlow = true;
          parents.unshift(parent.name);
          parent = parent.parent;
        }
        this.warn("Slow segment", { parents });
      }
    }

    this.trace("Leaving segment");
  }
}

function inSegment<T>(
  name: string,
  logger: Logger,
  meta: Meta,
  operation: Operation<T>,
): Promise<T> {
  let segment = new Segment(null, name, logger, meta);
  return runSegmentOperation(segment, operation);
}

export interface SegmentEntry {
  <T>(name: string, operation: Operation<T>): Promise<T>;
  <T>(name: string, meta: Meta, operation: Operation<T>): Promise<T>;
}

export function segmentEntry(
  getLogger: (name: string) => Logger,
): SegmentEntry {
  return <T>(
    name: string,
    ...args: [Operation<T>] | [Meta, Operation<T>]
  ): Promise<T> => {
    let logger = getLogger(name);
    let meta: Meta = args.length == 2 ? args[0] : {};
    let operation: Operation<T> = args.length == 2 ? args[1] : args[0];

    return inSegment(name, logger, meta, operation);
  };
}
