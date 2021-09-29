class QueryJoiner {
  public parts: string[] = [];
  public params: unknown[] = [];

  public pushPart(part: string): void {
    let lastPart = this.parts.pop() ?? "";
    this.parts.push(lastPart + part);
  }

  public pushParam(param: unknown): void {
    if (param instanceof RawSql) {
      this.push(param.parts, param.parameters);
    } else {
      this.params.push(param);
      this.parts.push("");
    }
  }

  public push(
    [...parts]: readonly string[],
    [...params]: readonly unknown[] = [],
  ): void {
    if (parts.length == 0) {
      throw new Error("No query provided");
    }

    if (params.length != parts.length - 1) {
      throw new Error(
        `Invalid number of parameters, saw ${
          params.length
        } but expected between ${parts.length - 1} and ${parts.length}`,
      );
    }

    this.pushPart(parts.shift()!);

    for (let i = 0; i < parts.length; i++) {
      this.pushParam(params[i]);
      this.pushPart(parts[i]);
    }
  }

  public toSql(): Sql {
    return new RawSql([...this.parts], [...this.params]);
  }
}

export interface Sql {
  readonly query: string;
  readonly parameters: readonly unknown[];
}

export function isSql(val: unknown): val is Sql {
  return val instanceof RawSql;
}

class RawSql implements Sql {
  public constructor(
    public readonly parts: readonly string[],
    public readonly parameters: readonly unknown[] = [],
  ) {
    if (parts.length == 0) {
      throw new Error("No query provided");
    }

    if (parameters.length != parts.length - 1) {
      throw new Error(
        `Invalid number of parameters, saw ${
          parameters.length
        } but expected between ${parts.length - 1} and ${parts.length}`,
      );
    }
  }

  public get query(): string {
    let parts = [this.parts[0]];

    for (let i = 1; i < this.parts.length; i++) {
      parts.push(`$${i}`);
      parts.push(this.parts[i]);
    }

    return parts.join("");
  }
}

export function sql(parts: TemplateStringsArray, ...params: unknown[]): Sql {
  let joiner = new QueryJoiner();
  joiner.push(parts, params);
  return joiner.toSql();
}

sql.raw = function (raw: string): Sql {
  return new RawSql([raw]);
};

sql.ref = function ref(...refs: string[]): Sql {
  if (refs.length == 0) {
    throw new Error("No refs passed.");
  }

  let allRefs: string[] = [];
  allRefs = allRefs
    .concat(...refs.map((ref: string): string[] => ref.split(".")))
    .map((part: string): string => (part == "*" ? part : `"${part}"`));

  return new RawSql([allRefs.join(".")]);
};

sql.join = function join(values: readonly unknown[], join: string): Sql {
  let joiner = new QueryJoiner();

  joiner.pushPart("");
  joiner.pushParam(values[0]);
  for (let i = 1; i < values.length; i++) {
    joiner.pushPart(join);
    joiner.pushParam(values[i]);
  }
  joiner.pushPart("");

  return joiner.toSql();
};
