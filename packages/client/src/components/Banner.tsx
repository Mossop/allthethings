import { Styles, ReactMemo, useBoolState, Link } from "@allthethings/ui";
import type { ReactResult } from "@allthethings/ui";
import { AppBar, Button, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";

import ContextMenu from "../ui/ContextMenu";
import LoginDialog from "../ui/LoginDialog";
import UserMenu from "../ui/UserMenu";
import { useUser, useView } from "../utils/view";
import Logo from "./Logo";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    banner: {
      ...Styles.flexCenteredRow,
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      justifyContent: "space-between",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    link: {
      ...Styles.flexCenteredRow,
    },
    logo: {
      paddingRight: theme.spacing(1),
      fontSize: "3rem",
    },
    pageControls: {
      fontSize: "1rem",
      ...Styles.flexCenteredRow,
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
  let view = useView();
  let [loginDialogShown, showLoginDialog, closeLoginDialog] = useBoolState();

  return <AppBar
    className={classes.banner}
    position="static"
    elevation={1}
    role="banner"
  >
    <h1 className={classes.title}>
      <Link href="/" className={classes.link}>
        <Logo className={classes.logo}/>
        <span>AllTheThings</span>
      </Link>
    </h1>
    {
      view?.user
        ? <PageControls/>
        : <Button onClick={showLoginDialog}>Login</Button>
    }
    {loginDialogShown && <LoginDialog onClosed={closeLoginDialog}/>}
  </AppBar>;
}
