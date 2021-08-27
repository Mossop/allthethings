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

import { useMarkTaskDueMutation, refetchQueriesForItem } from "../schema";
import type { Item } from "../schema";
import type { PopupStateProps } from "./GlobalPopups";
import { useGlobalMenuTrigger } from "./GlobalPopups";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inner: {
      paddingLeft: theme.spacing(4),
    },
    primary: {
      color: theme.palette.primary.main,
    },
    error: {
      color: theme.palette.error.main,
    },
  }),
);

interface DueMenuProps {
  item: Item;
  isInner?: boolean;
}

export const DueItemItems = ReactMemo(
  forwardRef(function DueItemItems(
    { item }: DueMenuProps,
    ref: ReactRef | null,
  ): ReactResult {
    let [markTaskDueMutation] = useMarkTaskDueMutation({
      refetchQueries: refetchQueriesForItem(item),
    });

    let markDue = useCallback(
      (due: DateTime | null) => {
        return markTaskDueMutation({
          variables: {
            id: item.id,
            due,
          },
        });
      },
      [item.id, markTaskDueMutation],
    );

    let notDue = useBoundCallback(markDue, null);

    let whenDue = useMemo(() => {
      let now = DateTime.now();

      if (!item.taskInfo?.due) {
        return null;
      }

      let time = item.taskInfo.due.toLocaleString(DateTime.TIME_SIMPLE);

      if (item.taskInfo.due.hasSame(now, "day")) {
        return time;
      }

      let date = item.taskInfo.due.toRelative();

      return `${time} ${date}`;
    }, [item]);

    if (!whenDue) {
      return null;
    }

    return (
      <List ref={ref} disablePadding={true}>
        <MenuItem disabled={true}>
          <ListItemText>Due {whenDue}</ListItemText>
        </MenuItem>
        <MenuItem onClick={notDue}>
          <ListItemText>Never Due</ListItemText>
        </MenuItem>
      </List>
    );
  }),
);

export const DueItems = ReactMemo(
  forwardRef(function DueItems(
    { item, isInner }: DueMenuProps,
    ref: ReactRef | null,
  ): ReactResult {
    let classes = useStyles();
    let [pickerOpen, openPicker, closePicker] = useBoolState();

    let [markTaskDueMutation] = useMarkTaskDueMutation({
      refetchQueries: refetchQueriesForItem(item),
    });

    let markTaskDue = useCallback(
      (due: DateTime | null) => {
        return markTaskDueMutation({
          variables: {
            id: item.id,
            due,
          },
        });
      },
      [item.id, markTaskDueMutation],
    );

    let dueThisAfternoon = useMemo(() => {
      let afternoon = DateTime.now().set({ hour: 17 }).startOf("hour");
      if (afternoon <= DateTime.now()) {
        return null;
      }

      return () => markTaskDue(afternoon);
    }, [markTaskDue]);

    let dueTomorrow = useCallback(() => {
      let tomorrow = DateTime.now()
        .plus({ days: 1 })
        .set({ hour: 8 })
        .startOf("hour");
      void markTaskDue(tomorrow);
    }, [markTaskDue]);

    let dueNextWeek = useCallback(() => {
      let nextWeek = DateTime.now()
        .plus({ weeks: 1 })
        .startOf("week")
        .set({ hour: 8 });
      void markTaskDue(nextWeek);
    }, [markTaskDue]);

    let className = isInner ? classes.inner : undefined;

    return (
      <List ref={ref} disablePadding={true}>
        {dueThisAfternoon && (
          <MenuItem className={className} onClick={dueThisAfternoon}>
            <ListItemText>This Afternoon</ListItemText>
          </MenuItem>
        )}
        <MenuItem className={className} onClick={dueTomorrow}>
          <ListItemText>Tomorrow</ListItemText>
        </MenuItem>
        <MenuItem className={className} onClick={dueNextWeek}>
          <ListItemText>Next Week</ListItemText>
        </MenuItem>
        <MenuItem className={className} onClick={openPicker}>
          <ListItemText>Custom...</ListItemText>
        </MenuItem>
        {pickerOpen && (
          <DateTimeDialog onSelect={markTaskDue} onClosed={closePicker} />
        )}
      </List>
    );
  }),
);

export const GlobalDueMenu = ReactMemo(function GlobalDueMenu({
  state,
  item,
}: DueMenuProps & PopupStateProps): ReactResult {
  return (
    <Menu
      state={state}
      keepMounted={true}
      anchor={{
        vertical: "bottom",
        horizontal: "right",
      }}
    >
      <DueItemItems item={item} />
      <DueItems item={item} />
    </Menu>
  );
});

export const DueMenuButton = ReactMemo(function DueMenuButton({
  item,
}: DueMenuProps): ReactResult {
  let classes = useStyles();
  let buttonProps = useGlobalMenuTrigger("due", GlobalDueMenu, { item });

  let isOverdue = useMemo(() => {
    if (!item.taskInfo?.due) {
      return false;
    }

    let now = DateTime.now();
    return now.toMillis() > item.taskInfo.due.toMillis();
  }, [item]);

  let whenDue = useMemo(() => {
    if (!item.taskInfo?.due) {
      return null;
    }

    let now = DateTime.now();
    let time = item.taskInfo.due.toLocaleString(DateTime.TIME_SIMPLE);

    if (item.taskInfo.due.hasSame(now, "day")) {
      return time;
    }

    let date = item.taskInfo.due.toRelative();

    return `${time} ${date}`;
  }, [item]);

  if (!whenDue) {
    return null;
  }

  return (
    <Tooltip title={`Due ${whenDue}`}>
      <IconButton
        className={isOverdue ? classes.error : classes.primary}
        {...buttonProps}
      >
        <Icons.Due />
      </IconButton>
    </Tooltip>
  );
});
