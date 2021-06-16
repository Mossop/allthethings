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
import type { Theme } from "@material-ui/core";
import {
  createStyles,
  IconButton,
  List,
  ListItemText,
  makeStyles,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import { DateTime } from "luxon";
import { useCallback, useMemo } from "react";

import type { Item } from "../utils/state";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inner: {
      paddingLeft: theme.spacing(4),
    },
  }));

interface SnoozeMenuProps {
  item: Item;
  onSnooze: (till: DateTime | null) => void;
  isInner?: boolean;
}

export const WakeUpItems = ReactMemo(function WakeUpItems({
  item,
  onSnooze,
}: SnoozeMenuProps): ReactResult {
  let wakeUp = useCallback(() => onSnooze(null), [onSnooze]);

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

  if (!wakesUp) {
    return null;
  }

  return <List disablePadding={true}>
    <MenuItem key="snoozedTill" disabled={true}>
      <ListItemText>Wakes up at {wakesUp}</ListItemText>
    </MenuItem>
    <MenuItem key="wakeUp" onClick={wakeUp}>
      <ListItemText>Wake up</ListItemText>
    </MenuItem>
  </List>;
});

export const SnoozeItems = ReactMemo(function SnoozeItems({
  onSnooze,
  isInner,
}: SnoozeMenuProps): ReactResult {
  let classes = useStyles();
  let [pickerOpen, openPicker, closePicker] = useBoolState();

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

  let className = isInner ? classes.inner : undefined;

  return <List disablePadding={true}>
    {
      snoozeAfternoon && <MenuItem className={className} onClick={snoozeAfternoon}>
        <ListItemText>This Afternoon</ListItemText>
      </MenuItem>
    }
    <MenuItem className={className} onClick={snoozeTomorrow}>
      <ListItemText>Tomorrow</ListItemText>
    </MenuItem>
    <MenuItem className={className} onClick={snoozeNextWeek}>
      <ListItemText>Next Week</ListItemText>
    </MenuItem>
    <MenuItem className={className} onClick={openPicker}>
      <ListItemText>Custom...</ListItemText>
    </MenuItem>
    {
      pickerOpen && <DateTimeDialog
        onSelect={onSnooze}
        onClosed={closePicker}
      />
    }
  </List>;
});

export default ReactMemo(function SnoozeMenu({
  item,
  onSnooze,
}: SnoozeMenuProps): ReactResult {
  let snoozeMenuState = useMenuState("snooze");

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

  if (!wakesUp) {
    return null;
  }

  return <>
    <Tooltip title={`Snoozed until ${wakesUp}`}>
      <IconButton
        color="primary"
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
      <WakeUpItems item={item} onSnooze={onSnooze}/>
      <SnoozeItems item={item} onSnooze={onSnooze}/>
    </Menu>
  </>;
});
