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
import { forwardRef, useCallback, useMemo } from "react";

import {
  useBoundCallback,
  useBoolState,
  Icons,
  ReactMemo,
  DateTimeDialog,
  Menu,
} from "#client/utils";
import type { ReactRef, ReactResult } from "#client/utils";

import { useSnoozeItemMutation, refetchQueriesForItem } from "../schema";
import type { Item } from "../schema";
import type { PopupStateProps } from "./GlobalPopups";
import { useGlobalMenuTrigger } from "./GlobalPopups";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inner: {
      paddingLeft: theme.spacing(4),
    },
  }),
);

interface SnoozeMenuProps {
  item: Item;
  isInner?: boolean;
}

export const WakeUpItems = ReactMemo(
  forwardRef(function WakeUpItems(
    { item }: SnoozeMenuProps,
    ref: ReactRef | null,
  ): ReactResult {
    let [snoozeItemMutation] = useSnoozeItemMutation({
      refetchQueries: refetchQueriesForItem(item),
    });

    let snoozeItem = useCallback(
      (till: DateTime | null) => {
        return snoozeItemMutation({
          variables: {
            id: item.id,
            snoozed: till,
          },
        });
      },
      [item.id, snoozeItemMutation],
    );

    let wakeUp = useBoundCallback(snoozeItem, null);

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

    return (
      <List ref={ref} disablePadding={true}>
        <MenuItem disabled={true}>
          <ListItemText>Wakes up at {wakesUp}</ListItemText>
        </MenuItem>
        <MenuItem onClick={wakeUp}>
          <ListItemText>Wake up</ListItemText>
        </MenuItem>
      </List>
    );
  }),
);

export const SnoozeItems = ReactMemo(
  forwardRef(function SnoozeItems(
    { item, isInner }: SnoozeMenuProps,
    ref: ReactRef | null,
  ): ReactResult {
    let classes = useStyles();
    let [pickerOpen, openPicker, closePicker] = useBoolState();

    let [snoozeItemMutation] = useSnoozeItemMutation({
      refetchQueries: refetchQueriesForItem(item),
    });

    let snoozeItem = useCallback(
      (till: DateTime | null) => {
        return snoozeItemMutation({
          variables: {
            id: item.id,
            snoozed: till,
          },
        });
      },
      [item.id, snoozeItemMutation],
    );

    let snoozeAfternoon = useMemo(() => {
      let afternoon = DateTime.now().set({ hour: 17 }).startOf("hour");
      if (afternoon <= DateTime.now()) {
        return null;
      }

      return () => snoozeItem(afternoon);
    }, [snoozeItem]);

    let snoozeTomorrow = useCallback(() => {
      let tomorrow = DateTime.now()
        .plus({ days: 1 })
        .set({ hour: 8 })
        .startOf("hour");
      void snoozeItem(tomorrow);
    }, [snoozeItem]);

    let snoozeNextWeek = useCallback(() => {
      let nextWeek = DateTime.now()
        .plus({ weeks: 1 })
        .startOf("week")
        .set({ hour: 8 });
      void snoozeItem(nextWeek);
    }, [snoozeItem]);

    let className = isInner ? classes.inner : undefined;

    return (
      <List ref={ref} disablePadding={true}>
        {snoozeAfternoon && (
          <MenuItem className={className} onClick={snoozeAfternoon}>
            <ListItemText>This Afternoon</ListItemText>
          </MenuItem>
        )}
        <MenuItem className={className} onClick={snoozeTomorrow}>
          <ListItemText>Tomorrow</ListItemText>
        </MenuItem>
        <MenuItem className={className} onClick={snoozeNextWeek}>
          <ListItemText>Next Week</ListItemText>
        </MenuItem>
        <MenuItem className={className} onClick={openPicker}>
          <ListItemText>Custom...</ListItemText>
        </MenuItem>
        {pickerOpen && (
          <DateTimeDialog onSelect={snoozeItem} onClosed={closePicker} />
        )}
      </List>
    );
  }),
);

export const GlobalSnoozeMenu = ReactMemo(function GlobalSnoozeMenu({
  state,
  item,
}: SnoozeMenuProps & PopupStateProps): ReactResult {
  return (
    <Menu
      state={state}
      keepMounted={true}
      anchor={{
        vertical: "bottom",
        horizontal: "right",
      }}
    >
      <WakeUpItems item={item} />
      <SnoozeItems item={item} />
    </Menu>
  );
});

export const SnoozeMenuButton = ReactMemo(function SnoozeMenuButton({
  item,
}: SnoozeMenuProps): ReactResult {
  let buttonProps = useGlobalMenuTrigger("snooze", GlobalSnoozeMenu, { item });

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

  return (
    <Tooltip title={`Snoozed until ${wakesUp}`}>
      <IconButton color="primary" {...buttonProps}>
        <Icons.Snooze />
      </IconButton>
    </Tooltip>
  );
});
