import type { Theme } from "@material-ui/core";
import {
  createStyles,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import clsx from "clsx";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import { useMenuState, bindTrigger, Icons, ReactMemo, Menu } from "#client/utils";
import type { ReactResult } from "#client/utils";

import type { Inbox, TaskList } from "../schema";
import { isInbox } from "../schema";
import type { ListFilter } from "../utils/filter";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    active: {
      color: theme.palette.primary.main,
    },
  }));

interface FilterMenuProps {
  list: TaskList | Inbox;
  filter: ListFilter;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
}

export default ReactMemo(function FilterMenu({
  list,
  filter,
  setFilter,
}: FilterMenuProps): ReactResult {
  let classes = useStyles();
  let filterMenuState = useMenuState("filter");

  let toggleComplete = useCallback(() => {
    setFilter((filter: ListFilter): ListFilter => ({
      ...filter,
      complete: !filter.complete,
    }));
  }, [setFilter]);
  let toggleArchived = useCallback(() => {
    setFilter((filter: ListFilter): ListFilter => ({
      ...filter,
      archived: !filter.archived,
    }));
  }, [setFilter]);
  let toggleSnoozed = useCallback(() => {
    setFilter((filter: ListFilter): ListFilter => ({
      ...filter,
      snoozed: !filter.snoozed,
    }));
  }, [setFilter]);

  let isFiltered = filter.archived || filter.complete || filter.snoozed;

  return <>
    <Tooltip title="Filter">
      <IconButton {...bindTrigger(filterMenuState)} color={isFiltered ? "primary" : "default"}>
        <Icons.Filter/>
      </IconButton>
    </Tooltip>
    <Menu
      state={filterMenuState}
      anchor={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
    >
      <MenuItem onClick={toggleComplete} className={clsx(filter.complete && classes.active)}>
        <ListItemIcon>
          <Icons.Checked/>
        </ListItemIcon>
        <ListItemText>Complete Tasks</ListItemText>
      </MenuItem>
      {
        !isInbox(list) && <MenuItem
          onClick={toggleArchived}
          className={clsx(filter.archived && classes.active)}
        >
          <ListItemIcon>
            <Icons.Archive/>
          </ListItemIcon>
          <ListItemText>Archived Items</ListItemText>
        </MenuItem>
      }
      <MenuItem onClick={toggleSnoozed} className={clsx(filter.snoozed && classes.active)}>
        <ListItemIcon>
          <Icons.Snooze/>
        </ListItemIcon>
        <ListItemText>Snoozed Items</ListItemText>
      </MenuItem>
    </Menu>
  </>;
});
