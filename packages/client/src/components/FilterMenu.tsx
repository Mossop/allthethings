import type { ReactResult } from "@allthethings/ui";
import { useMenuState, bindTrigger, Icons, ReactMemo, Menu } from "@allthethings/ui";
import {
  Badge,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import { ListFilter } from "../utils/view";

interface FilterMenuProps {
  filter: ListFilter;
  setFilter: Dispatch<SetStateAction<ListFilter>>;
}

export default ReactMemo(function FilterMenu({
  filter,
  setFilter,
}: FilterMenuProps): ReactResult {
  let filterMenuState = useMenuState("filter");

  let filterNormal = useCallback(() => setFilter(ListFilter.Normal), [setFilter]);
  let filterComplete = useCallback(() => setFilter(ListFilter.Complete), [setFilter]);
  let filterIncomplete = useCallback(() => setFilter(ListFilter.Incomplete), [setFilter]);
  let filterArchived = useCallback(() => setFilter(ListFilter.Archived), [setFilter]);
  let filterSnoozed = useCallback(() => setFilter(ListFilter.Snoozed), [setFilter]);

  let badge;
  switch (filter) {
    case ListFilter.Normal:
      badge = null;
      break;
    case ListFilter.Incomplete:
      badge = <Icons.Unchecked/>;
      break;
    case ListFilter.Complete:
      badge = <Icons.Checked/>;
      break;
    case ListFilter.Archived:
      badge = <Icons.Archive/>;
      break;
    case ListFilter.Snoozed:
      badge = <Icons.Snooze/>;
      break;
  }

  return <>
    <Tooltip title="Filter">
      <IconButton {...bindTrigger(filterMenuState)}>
        {
          badge
            ? <Badge badgeContent={badge} color="primary">
              <Icons.Filter/>
            </Badge>
            : <Icons.Filter/>
        }
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
      <MenuItem selected={filter == ListFilter.Normal} onClick={filterNormal}>
        <ListItemIcon>
          <Icons.Section/>
        </ListItemIcon>
        <ListItemText>Current Items</ListItemText>
      </MenuItem>
      <MenuItem selected={filter == ListFilter.Incomplete} onClick={filterIncomplete}>
        <ListItemIcon>
          <Icons.Unchecked/>
        </ListItemIcon>
        <ListItemText>Incomplete Tasks</ListItemText>
      </MenuItem>
      <MenuItem selected={filter == ListFilter.Complete} onClick={filterComplete}>
        <ListItemIcon>
          <Icons.Checked/>
        </ListItemIcon>
        <ListItemText>Complete Tasks</ListItemText>
      </MenuItem>
      <MenuItem selected={filter == ListFilter.Archived} onClick={filterArchived}>
        <ListItemIcon>
          <Icons.Archive/>
        </ListItemIcon>
        <ListItemText>Archived Items</ListItemText>
      </MenuItem>
      <MenuItem selected={filter == ListFilter.Snoozed} onClick={filterSnoozed}>
        <ListItemIcon>
          <Icons.Snooze/>
        </ListItemIcon>
        <ListItemText>Snoozed Items</ListItemText>
      </MenuItem>
    </Menu>
  </>;
});
