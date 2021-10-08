import AdminIcon from "@mui/icons-material/BusinessCenter";
import UsersIcon from "@mui/icons-material/People";
import AdminUserIcon from "@mui/icons-material/Person";
import UserIcon from "@mui/icons-material/PersonOutline";
import { IconButton } from "@mui/material";
import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { useCallback } from "react";

import {
  useBoolState,
  Styles,
  Icons,
  SettingsListItem,
  SettingsListSection,
  SubHeading,
  Heading,
  ReactMemo,
  SettingsPage,
} from "../../utils";
import type { ReactResult } from "../../utils";
import CreateUserDialog from "../dialogs/CreateUser";
import { useDeleteUserMutation, useListUsersQuery } from "../utils/api";
import { useUser } from "../utils/globalState";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: `calc(${theme.spacing(1)} + 2px)`,
    },
    userIcon: {
      ...Styles.flexCenteredRow,
      padding: theme.spacing(1),
    },
    userName: {
      padding: theme.spacing(1),
      flex: 1,
    },
    actions: {
      flex: 1,
      ...Styles.flexCenteredRow,
      justifyContent: "end",
    },
  }),
);

interface UserProps {
  id: string;
  isAdmin: boolean;
  email: string;
}

const User = ReactMemo(function User({
  id,
  isAdmin,
  email,
}: UserProps): ReactResult {
  let classes = useStyles();
  let user = useUser();

  let [deleteUserMutation] = useDeleteUserMutation();

  let deleteUser = useCallback(
    () => deleteUserMutation({ id }),
    [deleteUserMutation, id],
  );

  return (
    <SettingsListItem>
      <div className={classes.userIcon}>
        {isAdmin ? <AdminUserIcon /> : <UserIcon />}
      </div>
      <div className={classes.userName}>{email}</div>
      <div>
        {id != user.id && (
          <IconButton onClick={deleteUser}>
            <Icons.Delete />
          </IconButton>
        )}
      </div>
    </SettingsListItem>
  );
});

export default ReactMemo(function AdminPage(): ReactResult {
  let classes = useStyles();

  let [users] = useListUsersQuery();

  let [createUserDialogOpen, openCreateUserDialog, closeCreateUserDialog] =
    useBoolState();

  return (
    <SettingsPage
      heading={
        <>
          <AdminIcon />
          <Heading className={classes.headingText}>Administration</Heading>
        </>
      }
    >
      <SettingsListSection
        heading={
          <>
            <UsersIcon />
            <SubHeading className={classes.headingText}>Users</SubHeading>
            <div className={classes.actions}>
              <IconButton onClick={openCreateUserDialog}>
                <Icons.Add />
              </IconButton>
            </div>
          </>
        }
      >
        {users?.map((user: UserProps) => (
          <User key={user.id} {...user} />
        ))}
      </SettingsListSection>
      {createUserDialogOpen && (
        <CreateUserDialog onClosed={closeCreateUserDialog} />
      )}
    </SettingsPage>
  );
});
