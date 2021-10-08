import type { Theme } from "@mui/material";
import {
  IconButton,
  List,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { DateTime } from "luxon";
import { forwardRef, useCallback, useMemo } from "react";

import { encodeDateTime } from "../../../utils";
import {
  useBoundCallback,
  useBoolState,
  Icons,
  ReactMemo,
  DateTimeDialog,
  Menu,
} from "../../utils";
import type { ReactRef, ReactResult } from "../../utils";
import type { Item } from "../schema";
import { useEditItemMutation } from "../utils/api";
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
    let [editItemMutation] = useEditItemMutation();

    let snoozeItem = useCallback(
      (till: DateTime | null) => {
        return editItemMutation({
          id: item.id,
          params: {
            snoozed: encodeDateTime(till),
          },
        });
      },
      [item.id, editItemMutation],
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

    let [editItemMutation] = useEditItemMutation();

    let snoozeItem = useCallback(
      (till: DateTime | null) => {
        return editItemMutation({
          id: item.id,
          params: {
            snoozed: encodeDateTime(till),
          },
        });
      },
      [item.id, editItemMutation],
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
          <DateTimeDialog
            okText="Snooze"
            onSelect={snoozeItem}
            onClosed={closePicker}
          />
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
