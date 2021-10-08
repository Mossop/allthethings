import { Button, MenuItem } from "@mui/material";
import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { forwardRef, useCallback, useMemo } from "react";

import type { ReactRef, ReactResult } from "../../utils";
import {
  Icons,
  Styles,
  ReactMemo,
  pushUrl,
  Menu,
  useMenuState,
  bindTrigger,
  useBoolState,
} from "../../utils";
import CreateContextDialog from "../dialogs/CreateContext";
import type { Context } from "../schema";
import { nameSorted } from "../utils/collections";
import { useUser } from "../utils/globalState";
import type { LoggedInViewState } from "../utils/view";
import {
  useCurrentContext,
  ViewType,
  useLoggedInView,
  useUrl,
} from "../utils/view";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      ...Styles.flexCenteredRow,
      minWidth: "auto",
      textTransform: "none",
    },
    icon: {
      fontSize: "2em",
    },
    context: {
      marginLeft: theme.spacing(1),
    },
  }),
);

interface ContextMenuItemProps {
  name: string;
  target: Context;
  selected: boolean;
}

const ContextMenuItem = ReactMemo(
  forwardRef(function ContextMenuItem(
    { target, name, selected }: ContextMenuItemProps,
    ref: ReactRef | null,
  ): ReactResult {
    let view = useLoggedInView();

    let targetView: LoggedInViewState;
    switch (view.type) {
      case ViewType.Inbox:
        targetView = {
          type: ViewType.Inbox,
        };
        break;
      default:
        targetView = {
          type: ViewType.TaskList,
          taskList: target,
        };
    }

    let url = useUrl(targetView, target);

    let click = useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        pushUrl(url);
      },
      [url],
    );

    return (
      <MenuItem
        ref={ref}
        onClick={click}
        selected={selected}
        component="a"
        href={url.toString()}
      >
        {name}
      </MenuItem>
    );
  }),
);

export default ReactMemo(function ContextMenu(): ReactResult {
  let classes = useStyles();
  let [showCreateDialog, openCreateDialog, closeCreateDialog] =
    useBoolState(false);

  let contextMenuState = useMenuState("context-menu");
  let contexts = useUser().contexts;
  let currentContext = useCurrentContext();

  let sorted = useMemo(() => nameSorted(contexts.values()), [contexts]);

  return (
    <>
      <Button
        classes={{
          root: classes.button,
        }}
        variant="outlined"
        color="inherit"
        {...bindTrigger(contextMenuState)}
      >
        <Icons.Context className={classes.icon} />
        <div className={classes.context}>{currentContext.name}</div>
      </Button>
      <Menu
        state={contextMenuState}
        anchor={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        {sorted.map((context: Context) => (
          <ContextMenuItem
            key={context.id}
            name={context.name}
            target={context}
            selected={context.id == currentContext.id}
          />
        ))}
        <MenuItem onClick={openCreateDialog}>Add Context...</MenuItem>
      </Menu>
      {showCreateDialog && <CreateContextDialog onClosed={closeCreateDialog} />}
    </>
  );
});
