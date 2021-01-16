import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { forwardRef, useCallback, useMemo, useState } from "react";

import { ContextIcon } from "../components/Icons";
import { useNamedContextsQuery } from "../schema/queries";
import type { NamedContext } from "../schema/types";
import { pushState, usePageState } from "../utils/navigation";
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
  target: string;
  selected: boolean;
}

const ContextMenuItem = ReactMemo(
  forwardRef(function ContextMenuItem(
    { target, name, selected, onClick }: ContextMenuItemProps,
    ref: ReactRef | null,
  ): ReactResult {
    let click = useCallback(() => {
      pushState(target);
      onClick();
    }, [onClick, target]);

    return <MenuItem
      ref={ref}
      onClick={click}
      selected={selected}
      disabled={selected}
    >
      {name}
    </MenuItem>;
  }),
);

export default ReactMemo(function ContextMenu(): ReactResult {
  let classes = useStyles();
  let [showCreateDialog, setShowCreateDialog] = useState(false);

  let { selectedContext } = usePageState();

  let contextMenuState = usePopupState({ variant: "popover", popupId: "context-menu" });
  let { data } = useNamedContextsQuery();
  let contexts = useMemo(() => data?.user?.namedContexts ?? [], [data]);

  let sorted = useMemo(() => {
    let results = [...contexts];
    results.sort(
      (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name),
    );
    return results;
  }, [contexts]);

  let currentContext = useMemo(
    () => contexts.find((context: { id: string }) => context.id == selectedContext),
    [contexts, selectedContext],
  );

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
        target="/"
        onClick={closeMenu}
      />
      {
        sorted.map((context: Pick<NamedContext, "id" | "name" | "stub">) => <ContextMenuItem
          key={context.id}
          name={context.name}
          target={`/${context.stub}/`}
          selected={context === currentContext}
          onClick={closeMenu}
        />)
      }
      <MenuItem onClick={openCreateDialog}>Add Context...</MenuItem>
    </Menu>
    {showCreateDialog && <CreateContextDialog onClose={closeCreateDialog}/>}
  </>;
});
