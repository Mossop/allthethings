import { DateTime } from "luxon";
import { JsonDecoder } from "ts.data.json";

export enum DateTimeUnit {
  Millisecond = "millisecond",
  Second = "second",
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Weekday = "weekday",
  Week = "week",
  Month = "month",
  Year = "year",
}

export interface RelativeOffset {
  readonly type: "relative";
  readonly unit: DateTimeUnit;
  readonly value: number;
}

export interface AbsoluteOffset {
  readonly type: "absolute";
  readonly unit: Exclude<DateTimeUnit, DateTimeUnit.Week>;
  readonly value: number;
}

export interface StartOfOffset {
  readonly type: "start";
  readonly unit: Exclude<
    DateTimeUnit,
    DateTimeUnit.Weekday | DateTimeUnit.Millisecond
  >;
}

export interface EndOfOffset {
  readonly type: "end";
  readonly unit: Exclude<
    DateTimeUnit,
    DateTimeUnit.Weekday | DateTimeUnit.Millisecond
  >;
}

export interface ZonePart {
  readonly type: "zone";
  readonly zone: string;
}

export type DateTimeOffsetPart =
  | RelativeOffset
  | AbsoluteOffset
  | StartOfOffset
  | EndOfOffset
  | ZonePart;

const DateTimeUnitDecoder = JsonDecoder.enumeration<DateTimeUnit>(
  DateTimeUnit,
  "DateTimeUnit",
);

const StartOfOffsetDecoder = JsonDecoder.object<StartOfOffset>(
  {
    type: JsonDecoder.isExactly("start"),
    // @ts-ignore
    unit: DateTimeUnitDecoder,
  },
  "StartOfOffset",
);

const EndOfOffsetDecoder = JsonDecoder.object<EndOfOffset>(
  {
    type: JsonDecoder.isExactly("end"),
    // @ts-ignore
    unit: DateTimeUnitDecoder,
  },
  "EndOfOffset",
);

const ZonePartDecoder = JsonDecoder.object<ZonePart>(
  {
    type: JsonDecoder.isExactly("zone"),
    zone: JsonDecoder.string,
  },
  "ZonePart",
);

const RelativeOffsetDecoder = JsonDecoder.object<RelativeOffset>(
  {
    type: JsonDecoder.isExactly("relative"),
    value: JsonDecoder.number,
    unit: DateTimeUnitDecoder,
  },
  "RelativeOffset",
);

const AbsoluteOffsetDecoder = JsonDecoder.object<AbsoluteOffset>(
  {
    type: JsonDecoder.isExactly("absolute"),
    value: JsonDecoder.number,
    // @ts-ignore
    unit: DateTimeUnitDecoder,
  },
  "AbsoluteOffset",
);

export const DateTimeOffsetDecoder = JsonDecoder.array<DateTimeOffsetPart>(
  JsonDecoder.oneOf<DateTimeOffsetPart>(
    [
      RelativeOffsetDecoder,
      AbsoluteOffsetDecoder,
      StartOfOffsetDecoder,
      EndOfOffsetDecoder,
      ZonePartDecoder,
    ],
    "DateTimeOffsetPart",
  ),
  "DateTimeOffset",
);

export function addWeekdays(
  dateTime: DateTime,
  weekdays: number | null | undefined,
): DateTime {
  if (!weekdays) {
    return dateTime;
  }

  if (dateTime.weekday >= 6) {
    // If we're already on a weekend then we do some additional work to move past it.
    if (weekdays < 0) {
      dateTime = dateTime.set({ weekday: 5 });
      weekdays++;
    } else {
      dateTime = dateTime.plus({ days: 8 - dateTime.weekday });
      weekdays--;
    }
  }

  if (weekdays == 0) {
    return dateTime;
  }

  let days = weekdays % 5;
  let weeks = (weekdays - days) / 5;

  let newWeekday = dateTime.weekday + days;
  if (newWeekday < 1) {
    // Transitioned to the previous week, move past the weekend.
    days -= 2;
  } else if (newWeekday >= 6) {
    // Transitioned to the next week, move past the weekend.
    days += 2;
  }

  return dateTime.plus({
    days,
    weeks,
  });
}

export type DateTimeOffset = DateTimeOffsetPart[] | DateTimeOffsetPart;

export function addOffset(
  dateTime: DateTime,
  offset: DateTimeOffset,
): DateTime {
  if (!Array.isArray(offset)) {
    offset = [offset];
  }

  let current = dateTime;

  for (let part of offset) {
    switch (part.type) {
      case "relative": {
        if (part.unit == DateTimeUnit.Weekday) {
          current = addWeekdays(current, part.value);
        } else {
          current = current.plus({
            [part.unit]: part.value,
          });
        }
        break;
      }
      case "absolute":
        current = current.set({
          [part.unit]: part.value,
        });
        break;
      case "start":
        current = current.startOf(part.unit);
        break;
      case "end":
        current = current.endOf(part.unit);
        break;
      case "zone":
        current = current.setZone(part.zone);
        break;
    }
  }

  return current;
}

export function offsetFromJson(json: unknown): DateTimeOffset {
  let result = DateTimeOffsetDecoder.decode(json);
  if (result.isOk()) {
    return result.value;
  }

  throw new Error(result.error);
}

export type RelativeDateTime = DateTimeOffset | DateTime;

export function relativeDateTimeFromJson(json: unknown): RelativeDateTime {
  if (typeof json == "string") {
    return DateTime.fromISO(json);
  }
  return offsetFromJson(json);
}

interface Encoder<T> {
  (val: T): string;
  (val: T | null | undefined): string | null;
}

interface Decoder<T> {
  (val: string): T;
  (val: string | null): T | null;
  (val: string | undefined): T | undefined;
  (val: string | null | undefined): T | null | undefined;
}

function encoder<T>(mapper: (val: T) => string): Encoder<T> {
  function encoder(val: T): string;
  function encoder(val: T | null | undefined): string | null;
  function encoder(val: T | null | undefined): string | null {
    if (val === null || val === undefined) {
      return null;
    }

    return mapper(val);
  }

  return encoder;
}

function decoder<T>(mapper: (val: string) => T): Decoder<T> {
  function decoder(val: string): T;
  function decoder(val: string | null): T | null;
  function decoder(val: string | undefined): T | undefined;
  function decoder(val: string | null | undefined): T | null | undefined;
  function decoder(val: string | null | undefined): T | null | undefined {
    if (val === null || val === undefined) {
      return val;
    }

    return mapper(val);
  }

  return decoder;
}

export const encodeDateTime = encoder((val: DateTime): string => val.toISO());
export const decodeDateTime = decoder(
  (val: string): DateTime => DateTime.fromISO(val),
);
export const encodeRelativeDateTime = encoder(
  (val: RelativeDateTime): string => {
    if (DateTime.isDateTime(val)) {
      return val.toISO();
    }

    return JSON.stringify(val);
  },
);
export const decodeRelativeDateTime = decoder(
  (val: string): RelativeDateTime => {
    if (val.charAt(0) == "[" || val.charAt(0) == "{") {
      let json = JSON.parse(val);
      return offsetFromJson(json);
    }

    return DateTime.fromISO(val);
  },
);
export const encodeDateTimeOffset = encoder((val: DateTimeOffset): string =>
  JSON.stringify(val),
);
export const decodeDateTimeOffset = decoder(
  (val: string): DateTimeOffset => offsetFromJson(JSON.parse(val)),
);
