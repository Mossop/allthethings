import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useCallback, useState } from "react";

import { ContextIcon } from "../components/Icons";
import { useContextsQuery } from "../schema/queries";
import { flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import CreateContextDialog from "./CreateContextDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      ...flexRow,
      alignItems: "center",
      minWidth: "auto",
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

export default ReactMemo(function ContextMenu(): ReactResult {
  let classes = useStyles();
  let [showCreateDialog, setShowCreateDialog] = useState(false);

  let contextMenuState = usePopupState({ variant: "popover", popupId: "context-menu" });
  let { data } = useContextsQuery();
  let contexts = data?.user?.contexts ?? [];

  let openCreateDialog = useCallback(() => {
    contextMenuState.close();
    setShowCreateDialog(true);
  }, []);

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
    >
      {
        contexts.map((context: { id: string; name: string; }) => <MenuItem
          key={context.id}
        >
          {context.name}
        </MenuItem>)
      }
      <MenuItem onClick={openCreateDialog}>Add Context...</MenuItem>
    </Menu>
    {showCreateDialog && <CreateContextDialog onClose={closeCreateDialog}/>}
  </>;
});
