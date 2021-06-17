import type { ReactResult } from "@allthethings/ui";
import {
  useBoundCallback,
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

import { useMarkItemDueMutation, refetchQueriesForItem } from "../schema";
import type { Item } from "../schema";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inner: {
      paddingLeft: theme.spacing(4),
    },
  }));

interface DueMenuProps {
  item: Item;
  isInner?: boolean;
}

export const DueItemItems = ReactMemo(function DueItemItems({
  item,
}: DueMenuProps): ReactResult {
  let [markItemDueMutation] = useMarkItemDueMutation({
    refetchQueries: refetchQueriesForItem(item),
  });

  let markDue = useCallback((due: DateTime | null) => {
    return markItemDueMutation({
      variables: {
        id: item.id,
        due,
      },
    });
  }, [item.id, markItemDueMutation]);

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

  return <List disablePadding={true}>
    <MenuItem disabled={true}>
      <ListItemText>Due {whenDue}</ListItemText>
    </MenuItem>
    <MenuItem onClick={notDue}>
      <ListItemText>Never Due</ListItemText>
    </MenuItem>
  </List>;
});

export const DueItems = ReactMemo(function DueItems({
  item,
  isInner,
}: DueMenuProps): ReactResult {
  let classes = useStyles();
  let [pickerOpen, openPicker, closePicker] = useBoolState();

  let [markItemDueMutation] = useMarkItemDueMutation({
    refetchQueries: refetchQueriesForItem(item),
  });

  let markItemDue = useCallback((due: DateTime | null) => {
    return markItemDueMutation({
      variables: {
        id: item.id,
        due,
      },
    });
  }, [item.id, markItemDueMutation]);

  let dueThisAfternoon = useMemo(() => {
    let afternoon = DateTime.now().set({ hour: 17 }).startOf("hour");
    if (afternoon <= DateTime.now()) {
      return null;
    }

    return () => markItemDue(afternoon);
  }, [markItemDue]);

  let dueTomorrow = useCallback(() => {
    let tomorrow = DateTime.now().plus({ days: 1 }).set({ hour: 8 }).startOf("hour");
    void markItemDue(tomorrow);
  }, [markItemDue]);

  let dueNextWeek = useCallback(() => {
    let nextWeek = DateTime.now().plus({ weeks: 1 }).startOf("week").set({ hour: 8 });
    void markItemDue(nextWeek);
  }, [markItemDue]);

  let className = isInner ? classes.inner : undefined;

  return <List disablePadding={true}>
    {
      dueThisAfternoon && <MenuItem className={className} onClick={dueThisAfternoon}>
        <ListItemText>This Afternoon</ListItemText>
      </MenuItem>
    }
    <MenuItem className={className} onClick={dueTomorrow}>
      <ListItemText>Tomorrow</ListItemText>
    </MenuItem>
    <MenuItem className={className} onClick={dueNextWeek}>
      <ListItemText>Next Week</ListItemText>
    </MenuItem>
    <MenuItem className={className} onClick={openPicker}>
      <ListItemText>Custom...</ListItemText>
    </MenuItem>
    {
      pickerOpen && <DateTimeDialog
        onSelect={markItemDue}
        onClosed={closePicker}
      />
    }
  </List>;
});

export default ReactMemo(function DueMenu({
  item,
}: DueMenuProps): ReactResult {
  let dueMenuState = useMenuState("due");

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

  return <>
    <Tooltip title={`Due ${whenDue}`}>
      <IconButton
        color="primary"
        {...bindTrigger(dueMenuState)}
      >
        <Icons.Due/>
      </IconButton>
    </Tooltip>
    <Menu
      state={dueMenuState}
      anchor={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
    >
      <DueItemItems item={item}/>
      <DueItems item={item}/>
    </Menu>
  </>;
});
