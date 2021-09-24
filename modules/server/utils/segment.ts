import { performance } from "perf_hooks";

import type { Logger, LogMethod, Meta } from "#utils";

const MAX_SEGMENT_LENGTH = 1000;

function logMethod(level: string): LogMethod {
  return function (
    this: Segment,
    message: string | Error,
    meta: Meta = {},
  ): void {
    this.logger[level](message, {
      ...this.meta,
      ...meta,
      mark: Math.round(performance.now() - this.start),
    });
  };
}

type Operation<T, A extends unknown[] = []> = (
  segment: Segment,
  ...args: A
) => Promise<T>;

let loggedSegmentErrors = new WeakSet();

async function runSegmentOperation<T>(
  segment: Segment,
  operation: Operation<T>,
): Promise<T> {
  try {
    let result = await operation(segment);
    segment.finish();
    return result;
  } catch (error) {
    if (!loggedSegmentErrors.has(error)) {
      segment.error(error);
      loggedSegmentErrors.add(error);
    }

    segment.finish();
    throw error;
  }
}

export abstract class Segment implements Logger {
  protected readonly start = performance.now();
  protected end: number | null = null;
  protected currentChild: Segment | null = null;
  public readonly children: Segment[] = [];
  protected readonly meta: Meta;

  protected static nextSegmentID = 0;

  public constructor(
    protected readonly parent: Segment | null,
    protected readonly logger: Logger,
    public readonly name: string,
    meta: Meta,
  ) {
    this.trace("Entering segment");

    let tree: string[] = [];
    let segment: Segment = this;
    while (segment.parent) {
      tree.unshift(segment.name);
      segment = segment.parent;
    }

    this.meta = {
      ...parent?.meta,
      ...meta,
    };

    if (tree.length) {
      this.meta.tree = tree;
    }
  }

  public readonly error = logMethod("error");
  public readonly warn = logMethod("warn");
  public readonly info = logMethod("info");
  public readonly debug = logMethod("debug");
  public readonly trace = logMethod("trace");

  public get current(): Segment {
    return this.currentChild?.current ?? this;
  }

  public get duration(): number {
    return Math.round((this.end ?? performance.now()) - this.start);
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

    let segment = this.current.enterSegment(name, meta);
    return runSegmentOperation(segment, operation);
  }

  public enterSegment(name: string, meta: Meta): Segment {
    if (this.currentChild) {
      this.error(`Entering new segment while a child is still open.`);
    }

    this.currentChild = new ChildSegment(this, this.logger, name, meta);
    this.children.push(this.currentChild);
    return this.currentChild;
  }

  public get isClosed(): boolean {
    return this.end !== null;
  }

  public finish(): void {
    if (this.isClosed) {
      this.error("Double close");
      return;
    }

    if (
      this.currentChild ||
      !this.children.every((child: Segment): boolean => child.isClosed)
    ) {
      // this.error("Closing before all children were closed.");
    }

    if (this.parent?.currentChild === this) {
      this.parent.currentChild = null;
    }

    this.end = performance.now();

    this.trace("Leaving segment");
  }
}

class ChildSegment extends Segment {}

export class RootSegment extends Segment {
  public constructor(logger: Logger, name: string, meta: Meta) {
    super(null, logger, name, {
      ...meta,
      name,
      id: Segment.nextSegmentID++,
    });
  }

  public override finish(): void {
    super.finish();

    let length = this.end! - this.start;
    if (length >= MAX_SEGMENT_LENGTH) {
      interface SegmentTime {
        tree: string;
        duration: number;
      }

      let segmentTimes: [string, number][] = [];

      let addSegments = (tree: string[], segments: Segment[]) => {
        for (let child of segments) {
          let segmentTree = [...tree, child.name];
          segmentTimes.push([segmentTree.join(" -> "), child.duration]);

          addSegments(segmentTree, child.children);
        }
      };

      addSegments([], this.children);

      this.warn("Slow segment", { segmentTimes });
    }
  }
}

function inSegment<T>(
  name: string,
  logger: Logger,
  meta: Meta,
  operation: Operation<T>,
): Promise<T> {
  let segment = new RootSegment(logger, name, meta);
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
