import type { Theme } from "@mui/material";
import { IconButton } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { DateTime, SystemZone } from "luxon";
import type { ReactElement } from "react";
import { useMemo, useCallback, useState } from "react";

import { Icons, Styles } from ".";
import type {
  AbsoluteOffset,
  DateTimeOffset,
  DateTimeOffsetPart,
  EndOfOffset,
  RelativeOffset,
  StartOfOffset,
  ZonePart,
} from "../../utils";
import { addOffset, DateTimeUnit } from "../../utils";
import { Dialog } from "./Dialog";
import { Select, TextField, NumberField } from "./Forms";
import { useBoolState } from "./hooks";
import type { ReactResult } from "./types";
import { ReactMemo } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    partList: Styles.flexColumn,
    partRow: {
      ...Styles.flexCenteredRow,
      columnGap: theme.spacing(1),
    },
    addRow: {
      ...Styles.flexCenteredRow,
      justifyContent: "space-between",
    },
    part: {
      ...Styles.flexCenteredRow,
      columnGap: theme.spacing(1),
      flex: 1,
    },
  }),
);

interface PartProps<P extends DateTimeOffsetPart> {
  index: number;
  updatePart: (part: P) => void;
  part: P;
}

const ZoneItem = ReactMemo(function ZoneItem({
  part,
  updatePart,
}: PartProps<ZonePart>): ReactResult {
  let classes = useStyles();

  let update = useCallback(
    (value: string) =>
      updatePart({
        type: "zone",
        zone: value,
      }),
    [updatePart],
  );

  return (
    <div className={classes.part}>
      <TextField
        id="zone"
        label="Timezone"
        value={part.zone}
        onChange={update}
      />
    </div>
  );
});

const RelativeItem = ReactMemo(function RelativeItem({
  index,
  part,
  updatePart,
}: PartProps<RelativeOffset>): ReactResult {
  let classes = useStyles();

  let updateValue = useCallback(
    (value: number) => {
      updatePart({
        ...part,
        value,
      });
    },
    [part, updatePart],
  );

  let updateUnit = useCallback(
    (unit: RelativeOffset["unit"]) => {
      updatePart({
        ...part,
        unit,
      });
    },
    [part, updatePart],
  );

  return (
    <div className={classes.part}>
      <NumberField
        id={`value${index}`}
        value={part.value}
        onChange={updateValue}
      />
      <Select
        id={`unit${index}`}
        value={part.unit}
        onChange={updateUnit}
        items={{
          [DateTimeUnit.Millisecond]: "milliseconds",
          [DateTimeUnit.Second]: "seconds",
          [DateTimeUnit.Minute]: "minutes",
          [DateTimeUnit.Hour]: "hours",
          [DateTimeUnit.Day]: "days",
          [DateTimeUnit.Weekday]: "weekdays",
          [DateTimeUnit.Week]: "weeks",
          [DateTimeUnit.Month]: "months",
          [DateTimeUnit.Year]: "years",
        }}
      />
    </div>
  );
});

const AbsoluteItem = ReactMemo(function AbsoluteItem({
  index,
  part,
  updatePart,
}: PartProps<AbsoluteOffset>): ReactResult {
  let classes = useStyles();

  let updateValue = useCallback(
    (value: number) => {
      updatePart({
        ...part,
        value,
      });
    },
    [part, updatePart],
  );

  let updateUnit = useCallback(
    (unit: AbsoluteOffset["unit"]) => {
      updatePart({
        ...part,
        unit,
      });
    },
    [part, updatePart],
  );

  return (
    <div className={classes.part}>
      <Select
        id={`unit${index}`}
        value={part.unit}
        onChange={updateUnit}
        items={{
          [DateTimeUnit.Millisecond]: "milliseconds to",
          [DateTimeUnit.Second]: "seconds to",
          [DateTimeUnit.Minute]: "minutes to",
          [DateTimeUnit.Hour]: "hours to",
          [DateTimeUnit.Day]: "days to",
          [DateTimeUnit.Weekday]: "weekday to",
          [DateTimeUnit.Month]: "month to",
          [DateTimeUnit.Year]: "year to",
        }}
      />
      <NumberField
        id={`value${index}`}
        value={part.value}
        onChange={updateValue}
      />
    </div>
  );
});

const StartOfItem = ReactMemo(function StartItem({
  index,
  part,
  updatePart,
}: PartProps<StartOfOffset>): ReactResult {
  let classes = useStyles();

  let updateUnit = useCallback(
    (unit: StartOfOffset["unit"]) => {
      updatePart({
        ...part,
        unit,
      });
    },
    [part, updatePart],
  );

  return (
    <div className={classes.part}>
      <Select
        id={`unit${index}`}
        value={part.unit}
        onChange={updateUnit}
        items={{
          [DateTimeUnit.Second]: "the second",
          [DateTimeUnit.Minute]: "the minute",
          [DateTimeUnit.Hour]: "the hour",
          [DateTimeUnit.Day]: "the day",
          [DateTimeUnit.Week]: "the week",
          [DateTimeUnit.Month]: "the month",
          [DateTimeUnit.Year]: "the year",
        }}
      />
    </div>
  );
});

const EndOfItem = ReactMemo(function EndItem({
  index,
  part,
  updatePart,
}: PartProps<EndOfOffset>): ReactResult {
  let classes = useStyles();

  let updateUnit = useCallback(
    (unit: EndOfOffset["unit"]) => {
      updatePart({
        ...part,
        unit,
      });
    },
    [part, updatePart],
  );

  return (
    <div className={classes.part}>
      <Select
        id={`unit${index}`}
        value={part.unit}
        onChange={updateUnit}
        items={{
          [DateTimeUnit.Second]: "the second",
          [DateTimeUnit.Minute]: "the minute",
          [DateTimeUnit.Hour]: "the hour",
          [DateTimeUnit.Day]: "the day",
          [DateTimeUnit.Week]: "the week",
          [DateTimeUnit.Month]: "the month",
          [DateTimeUnit.Year]: "the year",
        }}
      />
    </div>
  );
});

interface OffsetPartProps {
  index: number;
  partCount: number;
  updatePart: (index: number, part: DateTimeOffsetPart) => void;
  deletePart: (index: number) => void;
  part: DateTimeOffsetPart;
}

const OffsetPart = ReactMemo(function OffsetPart({
  part,
  partCount,
  index,
  updatePart,
  deletePart,
}: OffsetPartProps): ReactResult {
  let classes = useStyles();

  let partProps = {
    index,
    updatePart: useCallback(
      (part: DateTimeOffsetPart) => updatePart(index, part),
      [index, updatePart],
    ),
  };

  let del = useCallback(() => deletePart(index), [deletePart, index]);

  let changeType = useCallback(
    (type: DateTimeOffsetPart["type"]) => {
      switch (type) {
        case "relative":
          updatePart(index, {
            type: "relative",
            value: 1,
            unit: DateTimeUnit.Week,
          });
          break;
        case "absolute":
          updatePart(index, {
            type: "absolute",
            value: 9,
            unit: DateTimeUnit.Hour,
          });
          break;
        case "end":
          updatePart(index, {
            type: "end",
            unit: DateTimeUnit.Day,
          });
          break;
        case "start":
          updatePart(index, {
            type: "start",
            unit: DateTimeUnit.Day,
          });
          break;
      }
    },
    [index, updatePart],
  );

  let component: ReactElement;
  switch (part.type) {
    case "zone":
      component = <ZoneItem part={part} {...partProps} />;
      break;
    case "relative":
      component = <RelativeItem part={part} {...partProps} />;
      break;
    case "absolute":
      component = <AbsoluteItem part={part} {...partProps} />;
      break;
    case "end":
      component = <EndOfItem part={part} {...partProps} />;
      break;
    case "start":
      component = <StartOfItem part={part} {...partProps} />;
      break;
  }

  return (
    <div className={classes.partRow}>
      {part.type != "zone" && (
        <Select
          id={`part${index}`}
          value={part.type}
          onChange={changeType}
          items={{
            relative: "In",
            absolute: "Set",
            end: "At the end of",
            start: "At the start of",
          }}
        />
      )}
      {component}
      {index > 0 && partCount > 2 && (
        <IconButton onClick={del}>
          <Icons.Delete />
        </IconButton>
      )}
    </div>
  );
});

export interface DateTimeOffsetDialogProps {
  title: string;
  initialValue?: DateTimeOffset | null;
  onSelect: (offset: DateTimeOffset) => void;
  onClosed: () => void;
}

export const DateTimeOffsetDialog = ReactMemo(function DateTimeOffsetDialog({
  initialValue,
  title,
  onSelect,
  onClosed,
}: DateTimeOffsetDialogProps): ReactResult {
  let classes = useStyles();
  let [isOpen, , close] = useBoolState(true);

  let [offsetParts, setOffsetParts] = useState<DateTimeOffsetPart[]>(
    (): DateTimeOffsetPart[] => {
      let parts: DateTimeOffsetPart[];
      if (!initialValue) {
        parts = [];
      } else if (!Array.isArray(initialValue)) {
        parts = [initialValue];
      } else {
        parts = [...initialValue];
      }

      if (parts.length < 1 || parts[0].type != "zone") {
        parts.unshift({
          type: "zone",
          zone: SystemZone.instance.name,
        });
      }

      if (parts.length == 1) {
        parts.push({
          type: "relative",
          value: 1,
          unit: DateTimeUnit.Week,
        });
      }

      return parts;
    },
  );

  let currentResult = useMemo(
    () => addOffset(DateTime.now(), offsetParts),
    [offsetParts],
  );

  let submit = useCallback(() => {
    onSelect(offsetParts);
    close();
  }, [close, onSelect, offsetParts]);

  let updatePart = useCallback(
    (index: number, part: DateTimeOffsetPart): void => {
      setOffsetParts((parts: DateTimeOffsetPart[]): DateTimeOffsetPart[] => {
        parts = [...parts];
        parts[index] = part;
        return parts;
      });
    },
    [],
  );

  let deletePart = useCallback((index: number) => {
    setOffsetParts((parts: DateTimeOffsetPart[]): DateTimeOffsetPart[] => {
      parts = [...parts];
      parts.splice(index, 1);
      return parts;
    });
  }, []);

  let addPart = useCallback(() => {
    setOffsetParts((parts: DateTimeOffsetPart[]): DateTimeOffsetPart[] => {
      parts = [...parts];
      parts.push({
        type: "relative",
        unit: DateTimeUnit.Week,
        value: 1,
      });
      return parts;
    });
  }, []);

  return (
    <Dialog
      title={title}
      onSubmit={submit}
      isOpen={isOpen}
      onClose={close}
      onClosed={onClosed}
    >
      <div className={classes.partList}>
        {offsetParts.map((part: DateTimeOffsetPart, index: number) => {
          let idx = `part${index}`;
          return (
            <OffsetPart
              key={idx}
              index={index}
              part={part}
              partCount={offsetParts.length}
              updatePart={updatePart}
              deletePart={deletePart}
            />
          );
        })}
        <div className={classes.addRow}>
          <div>{currentResult.toLocaleString(DateTime.DATETIME_SHORT)}</div>
          <IconButton onClick={addPart}>
            <Icons.Add />
          </IconButton>
        </div>
      </div>
    </Dialog>
  );
});
