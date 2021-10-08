import type { Theme } from "@mui/material";
import { IconButton } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { useCallback, useMemo } from "react";

import type {
  PhabricatorAccountState,
  PhabricatorQueryState,
  ReactResult,
} from "../../../../client/utils";
import {
  Heading,
  ImageIcon,
  SettingsPage,
  Styles,
  Icons,
  SettingsListSection,
  SubHeading,
  ReactMemo,
} from "../../../../client/utils";
import {
  useEditPhabricatorAccountMutation,
  useListPhabricatorQueriesQuery,
  useDeletePhabricatorAccountMutation,
} from "../api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: `calc(${theme.spacing(1)} + 2px)`,
    },
    actions: {
      flex: 1,
      ...Styles.flexCenteredRow,
      justifyContent: "end",
    },
    query: {
      ...Styles.flexCenteredRow,
    },
    queryDescription: {
      flex: 1,
    },
  }),
);

interface QueryProps {
  query: PhabricatorQueryState;
  enabled: boolean;
  onChangeQuery: (query: string, enabled: boolean) => void;
}

const Query = ReactMemo(function Query({
  query,
  enabled,
  onChangeQuery,
}: QueryProps): ReactResult {
  let classes = useStyles();

  let click = useCallback(() => {
    onChangeQuery(query.queryId, !enabled);
  }, [query, enabled, onChangeQuery]);

  return (
    <div className={classes.query}>
      <IconButton onClick={click}>
        {enabled ? <Icons.Checked /> : <Icons.Unchecked />}
      </IconButton>
      <div className={classes.queryDescription}>{query.description}</div>
    </div>
  );
});

interface AccountSettingsProps {
  account: PhabricatorAccountState;
}

export default ReactMemo(function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();

  let [queryList] = useListPhabricatorQueriesQuery();
  let queries = queryList ?? [];

  let [updateAccount] = useEditPhabricatorAccountMutation();

  let [deleteAccountMutation] = useDeletePhabricatorAccountMutation();

  let deleteAccount = useCallback(async () => {
    await deleteAccountMutation({ id: account.id });
  }, [account.id, deleteAccountMutation]);

  let onChangeQuery = useMemo(() => {
    return (query: string, enabled: boolean): void => {
      let enabledQueries = new Set(account.enabledQueries);
      if (enabled) {
        enabledQueries.add(query);
      } else {
        enabledQueries.delete(query);
      }

      void updateAccount({
        id: account.id,
        params: {
          queries: [...enabledQueries],
        },
      });
    };
  }, [account.enabledQueries, account.id, updateAccount]);

  return (
    <SettingsPage
      heading={
        <>
          <ImageIcon icon={account.icon} />
          <Heading className={classes.headingText}>
            Settings for {account.url}
          </Heading>
          <div className={classes.actions}>
            <IconButton onClick={deleteAccount}>
              <Icons.Delete />
            </IconButton>
          </div>
        </>
      }
    >
      <SettingsListSection heading={<SubHeading>Queries</SubHeading>}>
        {queries.map((query: PhabricatorQueryState) => (
          <Query
            key={query.queryId}
            query={query}
            enabled={account.enabledQueries.includes(query.queryId)}
            onChangeQuery={onChangeQuery}
          />
        ))}
      </SettingsListSection>
    </SettingsPage>
  );
});
