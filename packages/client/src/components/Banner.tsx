import { AppBar, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";

import ContextMenu from "../ui/ContextMenu";
import UserMenu from "../ui/UserMenu";
import { useUser } from "../utils/state";
import { flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import { useMaybeView } from "../utils/view";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    banner: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      ...flexRow,
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    pageControls: {
      fontSize: "1rem",
      ...flexRow,
      alignItems: "center",
      columnGap: theme.spacing(2),
    },
  }));

const PageControls = ReactMemo(function PageControls(): ReactResult {
  let classes = useStyles();
  let user = useUser();

  return <div className={classes.pageControls}>
    <ContextMenu/>
    <UserMenu user={user}/>
  </div>;
});

export default function Banner(): ReactResult {
  let classes = useStyles();
  let view = useMaybeView();

  return <AppBar
    className={classes.banner}
    position="static"
    elevation={1}
    role="banner"
  >
    <h1 className={classes.title}>AllTheThings</h1>
    {view && <PageControls/>}
  </AppBar>;
}