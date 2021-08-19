import { DateTime } from "luxon";
import { JsonDecoder } from "ts.data.json";

export interface RelativeOffset {
  readonly type: "relative";
  readonly years?: number;
  readonly quarters?: number;
  readonly months?: number;
  readonly weeks?: number;
  readonly weekdays?: number;
  readonly days?: number;
  readonly hours?: number;
  readonly minutes?: number;
  readonly seconds?: number;
  readonly milliseconds?: number;
}

export interface AbsoluteOffset {
  readonly type: "absolute";
  readonly year?: number;
  readonly month?: number;
  readonly weekday?: number;
  readonly day?: number;
  readonly hour?: number;
  readonly minute?: number;
  readonly second?: number;
  readonly millisecond?: number;
}

export enum LimitUnit {
  Second = "second",
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Week = "week",
  Month = "month",
  Quarter = "quarter",
  Year = "year",
}

export interface StartOfOffset {
  readonly type: "start";
  readonly unit: LimitUnit;
}

export interface EndOfOffset {
  readonly type: "end";
  readonly unit: LimitUnit;
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

const LimitUnitDecoder = JsonDecoder.enumeration<LimitUnit>(
  LimitUnit,
  "LimitUnit",
);

const StartOfOffsetDecoder = JsonDecoder.object<StartOfOffset>(
  {
    type: JsonDecoder.isExactly("start"),
    unit: LimitUnitDecoder,
  },
  "StartOfOffset",
);

const EndOfOffsetDecoder = JsonDecoder.object<EndOfOffset>(
  {
    type: JsonDecoder.isExactly("end"),
    unit: LimitUnitDecoder,
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
    years: JsonDecoder.optional(JsonDecoder.number),
    quarters: JsonDecoder.optional(JsonDecoder.number),
    months: JsonDecoder.optional(JsonDecoder.number),
    weeks: JsonDecoder.optional(JsonDecoder.number),
    weekdays: JsonDecoder.optional(JsonDecoder.number),
    days: JsonDecoder.optional(JsonDecoder.number),
    hours: JsonDecoder.optional(JsonDecoder.number),
    minutes: JsonDecoder.optional(JsonDecoder.number),
    seconds: JsonDecoder.optional(JsonDecoder.number),
    milliseconds: JsonDecoder.optional(JsonDecoder.number),
  },
  "RelativeOffset",
);

const AbsoluteOffsetDecoder = JsonDecoder.object<AbsoluteOffset>(
  {
    type: JsonDecoder.isExactly("absolute"),
    year: JsonDecoder.optional(JsonDecoder.number),
    month: JsonDecoder.optional(JsonDecoder.number),
    weekday: JsonDecoder.optional(JsonDecoder.number),
    day: JsonDecoder.optional(JsonDecoder.number),
    hour: JsonDecoder.optional(JsonDecoder.number),
    minute: JsonDecoder.optional(JsonDecoder.number),
    second: JsonDecoder.optional(JsonDecoder.number),
    millisecond: JsonDecoder.optional(JsonDecoder.number),
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

export function addWeekdays(dateTime: DateTime, weekdays: number): DateTime {
  if (weekdays == 0) {
    return dateTime;
  }

  if (dateTime.weekday >= 6) {
    // Already on a weekend.
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

  let target = dateTime.weekday + days;
  if (target < 1) {
    // Transitioned to the previous week, move past the weekend.
    days -= 2;
  } else if (target >= 6) {
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
        let { type, weekdays, ...duration } = part;
        current = addWeekdays(current.plus(duration), weekdays ?? 0);
        break;
      }
      case "absolute":
        current = current.set(part);
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
