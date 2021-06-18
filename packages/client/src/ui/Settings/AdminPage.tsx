import type { ReactResult } from "@allthethings/ui";
import {
  useBoolState,
  Styles,
  Icons, SettingsListItem,
  SettingsListSection,
  SubHeading,
  Heading,
  ReactMemo,
  SettingsPage,
} from "@allthethings/ui";
import type { Theme } from "@material-ui/core";
import { IconButton, makeStyles, createStyles } from "@material-ui/core";
import AdminIcon from "@material-ui/icons/BusinessCenter";
import UsersIcon from "@material-ui/icons/People";
import AdminUserIcon from "@material-ui/icons/Person";
import UserIcon from "@material-ui/icons/PersonOutline";
import { useCallback } from "react";

import { useDeleteUserMutation } from "../../schema";
import { refetchListUsersQuery, useListUsersQuery } from "../../schema/queries";
import { useUser } from "../../utils/view";
import CreateUserDialog from "./CreateUserDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: theme.spacing(1) + 2,
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
  }));

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

  let [deleteUserMutation] = useDeleteUserMutation({
    variables: {
      id,
    },
    refetchQueries: [
      refetchListUsersQuery(),
    ],
  });

  let deleteUser = useCallback(() => deleteUserMutation(), [deleteUserMutation]);

  return <SettingsListItem>
    <div className={classes.userIcon}>
      {isAdmin ? <AdminUserIcon/> : <UserIcon/>}
    </div>
    <div className={classes.userName}>{email}</div>
    <div>
      {
        id != user.id && <IconButton onClick={deleteUser}>
          <Icons.Delete/>
        </IconButton>
      }
    </div>
  </SettingsListItem>;
});

export default ReactMemo(function AdminPage(): ReactResult {
  let classes = useStyles();

  let { data } = useListUsersQuery();
  let users = data?.users ?? [];

  let [createUserDialogOpen, openCreateUserDialog, closeCreateUserDialog] = useBoolState();

  return <SettingsPage
    heading={
      <>
        <AdminIcon/>
        <Heading className={classes.headingText}>Administration</Heading>
      </>
    }
  >
    <SettingsListSection
      heading={
        <>
          <UsersIcon/>
          <SubHeading className={classes.headingText}>Users</SubHeading>
          <div className={classes.actions}>
            <IconButton onClick={openCreateUserDialog}>
              <Icons.Add/>
            </IconButton>
          </div>
        </>
      }
    >
      {
        users.map((user: UserProps) => <User key={user.id} {...user}/>)
      }
    </SettingsListSection>
    {createUserDialogOpen && <CreateUserDialog onClosed={closeCreateUserDialog}/>}
  </SettingsPage>;
});
