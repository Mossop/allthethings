import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { forwardRef, useCallback, useMemo, useState } from "react";

import { ContextIcon } from "../components/Icons";
import { pushState, ViewType } from "../utils/navigation";
import { nameSorted } from "../utils/sort";
import type { NavigableView, NamedContext, User } from "../utils/state";
import {
  useView,
  isNamedContext,
  useUser,
  useUrl,
  useCurrentNamedContext,
  useNamedContexts,
} from "../utils/state";
import { flexRow } from "../utils/styles";
import type { ReactRef, ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import CreateContextDialog from "./CreateContextDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      ...flexRow,
      alignItems: "center",
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
  onClick: () => void;
  name: string;
  target: User | NamedContext;
  selected: boolean;
}

const ContextMenuItem = ReactMemo(
  forwardRef(function ContextMenuItem(
    { target, name, selected, onClick }: ContextMenuItemProps,
    ref: ReactRef | null,
  ): ReactResult {
    let view = useView();

    let targetView: NavigableView | null;
    if (view) {
      switch (view.type) {
        case ViewType.Inbox:
          targetView = {
            type: ViewType.Inbox,
            namedContext: isNamedContext(target) ? target : null,
          };
          break;
        default:
          targetView = {
            type: ViewType.Owner,
            owner: target,
            namedContext: isNamedContext(target) ? target : null,
          };
      }
    } else {
      targetView = null;
    }

    let url = useUrl(targetView);

    let click = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      pushState(url);
      onClick();
    }, [onClick, url]);

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
  let [showCreateDialog, setShowCreateDialog] = useState(false);

  let contextMenuState = usePopupState({ variant: "popover", popupId: "context-menu" });
  let contexts = useNamedContexts();
  let currentContext = useCurrentNamedContext();
  let user = useUser();

  let sorted = useMemo(() => nameSorted(contexts.values()), [contexts]);

  let closeMenu = useCallback(() => {
    contextMenuState.close();
  }, [contextMenuState]);

  let openCreateDialog = useCallback(() => {
    closeMenu();
    setShowCreateDialog(true);
  }, [closeMenu]);

  let closeCreateDialog = useCallback(() => {
    setShowCreateDialog(false);
  }, []);

  if (!user) {
    return null;
  }

  return <>
    <Button
      classes={
        {
          root: classes.button,
          label: classes.label,
        }
      }
      variant="outlined"
      {...bindTrigger(contextMenuState)}
    >
      <ContextIcon className={classes.icon}/>
      {currentContext && <div className={classes.context}>{currentContext.name}</div>}
    </Button>
    <Menu
      {...bindMenu(contextMenuState)}
      anchorOrigin={
        {
          vertical: "bottom",
          horizontal: "right",
        }
      }
      transformOrigin={
        {
          vertical: "top",
          horizontal: "right",
        }
      }
      keepMounted={true}
      getContentAnchorEl={null}
      variant="menu"
    >
      <ContextMenuItem
        name="No Context."
        selected={!currentContext}
        target={user}
        onClick={closeMenu}
      />
      {
        sorted.map((context: NamedContext) => <ContextMenuItem
          key={context.id}
          name={context.name}
          target={context}
          selected={context.id == currentContext?.id}
          onClick={closeMenu}
        />)
      }
      <MenuItem onClick={openCreateDialog}>Add Context...</MenuItem>
    </Menu>
    {showCreateDialog && <CreateContextDialog onClose={closeCreateDialog}/>}
  </>;
});
