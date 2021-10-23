import AdminIcon from "@mui/icons-material/BusinessCenter";
import SettingsIcon from "@mui/icons-material/Settings";
import type { Theme } from "@mui/material";
import { Divider, ListSubheader, Paper, List } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { Fragment, useCallback } from "react";

import {
  SettingsContext,
  SettingsPageItem,
  useServices,
  ReactMemo,
  Icons,
  Styles,
  Text,
} from "../../utils";
import type { ClientService, ReactResult } from "../../utils";
import Page from "../components/Page";
import { useUser } from "../utils/globalState";
import { pushView, useUrl, ViewType, useCurrentContext } from "../utils/view";
import AdminPage from "./Admin";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      ...Styles.pageStyles(theme),
      flex: 1,
    },
    list: {
      paddingTop: theme.spacing(2),
      paddingBottom: 0,
    },
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    serviceHeader: {
      lineHeight: "inherit",
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
  }),
);

function SettingsSidebar(): ReactResult {
  let classes = useStyles();
  let services = useServices();

  let taskLink = useUrl({
    type: ViewType.TaskList,
    taskList: useCurrentContext(),
  });

  let user = useUser();

  return (
    <Paper elevation={2} component="nav" square={true}>
      <List component="div" className={classes.list}>
        <SettingsPageItem href={taskLink.toString()} icon={<Icons.Back />}>
          Back to Tasks
        </SettingsPageItem>
        <Divider className={classes.divider} />
        <SettingsPageItem page="general" icon={<SettingsIcon />}>
          General
        </SettingsPageItem>
        {user.isAdmin && (
          <SettingsPageItem page="admin" icon={<AdminIcon />}>
            Administration
          </SettingsPageItem>
        )}
        {services.map((service: ClientService) =>
          service.renderServiceSettingsPageList ? (
            <Fragment key={service.serverId}>
              <Divider className={classes.divider} />
              <List disablePadding={true}>
                <ListSubheader
                  disableSticky={true}
                  className={classes.serviceHeader}
                >
                  {service.name}
                </ListSubheader>
                {service.renderServiceSettingsPageList()}
              </List>
            </Fragment>
          ) : null,
        )}
      </List>
    </Paper>
  );
}

interface SettingsPageProps {
  page: string;
  serviceId?: string;
}

const SettingsPage = ReactMemo(function SettingsPage({
  page,
  serviceId,
}: SettingsPageProps): ReactResult {
  let services = useServices();

  if (serviceId) {
    for (let service of services) {
      if (service.serverId == serviceId && service.renderServiceSettingsPage) {
        return service.renderServiceSettingsPage(page);
      }
    }
  } else {
    switch (page) {
      case "general":
        return <Text>General settings.</Text>;
      case "admin":
        return <AdminPage />;
    }
  }

  return <Text>Unknown settings.</Text>;
});

interface SettingsProps {
  page: string;
  serviceId?: string;
}

export default ReactMemo(function Settings({
  page,
  serviceId,
}: SettingsProps): ReactResult {
  let classes = useStyles();

  let updateSection = useCallback((page: string, serviceId?: string): void => {
    pushView({
      type: ViewType.Settings,
      page,
      serviceId,
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ page, setPage: updateSection }}>
      <Page sidebar={<SettingsSidebar />}>
        <div className={classes.content}>
          <SettingsPage page={page} serviceId={serviceId} />
        </div>
      </Page>
    </SettingsContext.Provider>
  );
});
