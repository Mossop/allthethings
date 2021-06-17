import {
  Icons,
  Styles,
  ReactMemo,
  pushUrl,
  Menu,
  useMenuState,
  bindTrigger,
  useBoolState,
} from "@allthethings/ui";
import type { ReactRef, ReactResult } from "@allthethings/ui";
import { Button, MenuItem, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import { forwardRef, useCallback, useMemo } from "react";

import type { Context, ProjectRoot } from "../schema";
import { isContext } from "../schema";
import { nameSorted } from "../utils/collections";
import type { NavigableView } from "../utils/view";
import { useContexts, useCurrentContext, useUser, ViewType, useView, useUrl } from "../utils/view";
import CreateContextDialog from "./CreateContextDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      ...Styles.flexCenteredRow,
      minWidth: "auto",
      textTransform: "none",
    },
    label: {
      width: "auto",
    },
    icon: {
      fontSize: "2em",
    },
    context: {
      marginLeft: theme.spacing(1),
    },
  }));

interface ContextMenuItemProps {
  name: string;
  target: ProjectRoot;
  selected: boolean;
}

const ContextMenuItem = ReactMemo(
  forwardRef(function ContextMenuItem(
    { target, name, selected }: ContextMenuItemProps,
    ref: ReactRef | null,
  ): ReactResult {
    let view = useView();

    let targetView: NavigableView;
    switch (view.type) {
      case ViewType.Inbox:
        targetView = {
          type: ViewType.Inbox,
          context: isContext(target) ? target : null,
        };
        break;
      default:
        targetView = {
          type: ViewType.TaskList,
          taskList: target,
          context: isContext(target) ? target : null,
        };
    }

    let url = useUrl(targetView);

    let click = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      pushUrl(url);
    }, [url]);

    return <MenuItem
      ref={ref}
      onClick={click}
      selected={selected}
      component="a"
      href={url.toString()}
    >
      {name}
    </MenuItem>;
  }),
);

export default ReactMemo(function ContextMenu(): ReactResult {
  let classes = useStyles();
  let [showCreateDialog, openCreateDialog, closeCreateDialog] = useBoolState(false);

  let contextMenuState = useMenuState("context-menu");
  let contexts = useContexts();
  let currentContext = useCurrentContext();
  let user = useUser();

  let sorted = useMemo(() => nameSorted(contexts.values()), [contexts]);

  return <>
    <Button
      classes={
        {
          root: classes.button,
          label: classes.label,
        }
      }
      variant="outlined"
      color="inherit"
      {...bindTrigger(contextMenuState)}
    >
      <Icons.Context className={classes.icon}/>
      {currentContext && <div className={classes.context}>{currentContext.name}</div>}
    </Button>
    <Menu
      state={contextMenuState}
      anchor={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
    >
      <ContextMenuItem
        name="No Context."
        selected={!currentContext}
        target={user}
      />
      {
        sorted.map((context: Context) => <ContextMenuItem
          key={context.id}
          name={context.name}
          target={context}
          selected={context.id == currentContext?.id}
        />)
      }
      <MenuItem onClick={openCreateDialog}>Add Context...</MenuItem>
    </Menu>
    {showCreateDialog && <CreateContextDialog onClosed={closeCreateDialog}/>}
  </>;
});
