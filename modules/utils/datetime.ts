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

export function encodeRelativeDateTime(rdt: RelativeDateTime): string {
  if (DateTime.isDateTime(rdt)) {
    return rdt.toISO();
  }

  return JSON.stringify(rdt);
}

export function decodeRelativeDateTime(value: string): RelativeDateTime {
  if (value.charAt(0) == "[" || value.charAt(0) == "{") {
    let json = JSON.parse(value);
    return offsetFromJson(json);
  }

  return DateTime.fromISO(value);
}

export function encodeDateTime(dt: DateTime): string;
export function encodeDateTime(dt: DateTime | undefined | null): string | null;
export function encodeDateTime(dt: DateTime | undefined | null): string | null {
  if (dt) {
    return dt.toISO();
  }

  return null;
}

export function decodeDateTime(val: string): DateTime;
export function decodeDateTime(val: string | undefined | null): DateTime | null;
export function decodeDateTime(
  val: string | undefined | null,
): DateTime | null {
  if (val) {
    return DateTime.fromISO(val);
  }

  return null;
}
