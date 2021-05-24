import type { ReactResult } from "@allthethings/ui";
import {
  useBoolState,
  useMenuState,
  bindTrigger,
  Icons,
  ReactMemo,
  Menu,
  DateTimeDialog,
} from "@allthethings/ui";
import {
  IconButton,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import { DateTime } from "luxon";
import { useCallback, useMemo } from "react";

import type { Item } from "../utils/state";

interface SnoozeMenuProps {
  item: Item;
  onSnooze: (till: DateTime | null) => void;
}

export default ReactMemo(function SnoozeMenu({
  item,
  onSnooze,
}: SnoozeMenuProps): ReactResult {
  let snoozeMenuState = useMenuState("snooze");
  let [pickerOpen, openPicker, closePicker] = useBoolState();

  let wakeUp = useCallback(() => onSnooze(null), [onSnooze]);

  let snoozeAfternoon = useMemo(() => {
    let afternoon = DateTime.now().set({ hour: 17 }).startOf("hour");
    if (afternoon <= DateTime.now()) {
      return null;
    }

    return () => onSnooze(afternoon);
  }, [onSnooze]);

  let snoozeTomorrow = useCallback(() => {
    let tomorrow = DateTime.now().plus({ days: 1 }).set({ hour: 8 }).startOf("hour");
    onSnooze(tomorrow);
  }, [onSnooze]);

  let snoozeNextWeek = useCallback(() => {
    let nextWeek = DateTime.now().plus({ weeks: 1 }).startOf("week").set({ hour: 8 });
    onSnooze(nextWeek);
  }, [onSnooze]);

  let wakesUp = useMemo(() => {
    let now = DateTime.now();

    if (!item.snoozed || item.snoozed <= now) {
      return null;
    }

    let time = item.snoozed.toLocaleString(DateTime.TIME_SIMPLE);

    if (item.snoozed.hasSame(now, "day")) {
      return time;
    }

    let date = item.snoozed.toRelative();

    return `${time} ${date}`;
  }, [item]);

  return <>
    <Tooltip title={wakesUp ? `Snoozed until ${wakesUp}` : "Snooze"}>
      <IconButton
        color={wakesUp ? "primary" : "default"}
        {...bindTrigger(snoozeMenuState)}
      >
        <Icons.Snooze/>
      </IconButton>
    </Tooltip>
    <Menu
      state={snoozeMenuState}
      anchor={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
    >
      {
        wakesUp && <MenuItem disabled={true}>
          <ListItemText>Wakes up at {wakesUp}</ListItemText>
        </MenuItem>
      }
      {
        wakesUp && <MenuItem onClick={wakeUp}>
          <ListItemText>Wake up</ListItemText>
        </MenuItem>
      }
      {
        snoozeAfternoon && <MenuItem onClick={snoozeAfternoon}>
          <ListItemText>This Afternoon</ListItemText>
        </MenuItem>
      }
      <MenuItem onClick={snoozeTomorrow}>
        <ListItemText>Tomorrow</ListItemText>
      </MenuItem>
      <MenuItem onClick={snoozeNextWeek}>
        <ListItemText>Next Week</ListItemText>
      </MenuItem>
      <MenuItem onClick={openPicker}>
        <ListItemText>Custom...</ListItemText>
      </MenuItem>
    </Menu>
    {
      pickerOpen && <DateTimeDialog
        onSelect={onSnooze}
        onClosed={closePicker}
      />
    }
  </>;
});
