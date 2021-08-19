import { DateTime } from "luxon";

import { addWeekdays } from "./datetime";

test("weekdays", async (): Promise<void> => {
  expect(addWeekdays(DateTime.fromISO("2021-08-19"), 5).toISODate()).toBe(
    "2021-08-26",
  );

  expect(addWeekdays(DateTime.fromISO("2021-08-19"), 3).toISODate()).toBe(
    "2021-08-24",
  );

  expect(addWeekdays(DateTime.fromISO("2021-08-19"), 14).toISODate()).toBe(
    "2021-09-08",
  );

  expect(addWeekdays(DateTime.fromISO("2021-08-19"), -5).toISODate()).toBe(
    "2021-08-12",
  );

  expect(addWeekdays(DateTime.fromISO("2021-08-19"), -3).toISODate()).toBe(
    "2021-08-16",
  );

  expect(addWeekdays(DateTime.fromISO("2021-08-19"), -14).toISODate()).toBe(
    "2021-07-30",
  );
});
