import type { Theme } from "@material-ui/core";
import { makeStyles, createStyles, IconButton } from "@material-ui/core";
import { useCallback, useMemo } from "react";

import type { ReactResult } from "#client-utils";
import {
  Heading,
  ImageIcon,
  SettingsPage,
  Styles,
  Icons,
  useResetStore,
  SettingsListSection,
  SubHeading,
  ReactMemo,
} from "#client-utils";
import type { PhabricatorAccount, PhabricatorQuery } from "#schema";

import {
  useUpdatePhabricatorAccountMutation,
  useListPhabricatorQueriesQuery,
  refetchListPhabricatorAccountsQuery,
  useDeletePhabricatorAccountMutation,
} from "../operations";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headingText: {
      padding: theme.spacing(1) + 2,
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
  }));

interface QueryProps {
  query: PhabricatorQuery;
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

  return <div className={classes.query}>
    <IconButton onClick={click}>
      {enabled ? <Icons.Checked/> : <Icons.Unchecked/>}
    </IconButton>
    <div className={classes.queryDescription}>
      {query.description}
    </div>
  </div>;
});

interface AccountSettingsProps {
  account: PhabricatorAccount;
}

export default ReactMemo(function AccountSettings({
  account,
}: AccountSettingsProps): ReactResult {
  let classes = useStyles();
  let resetStore = useResetStore();

  let { data: queryList } = useListPhabricatorQueriesQuery();
  let queries = queryList?.user?.phabricatorQueries ?? [];

  let [updateAccount] = useUpdatePhabricatorAccountMutation({
    refetchQueries: [
      refetchListPhabricatorAccountsQuery(),
    ],
  });

  let [deleteAccountMutation] = useDeletePhabricatorAccountMutation({
    variables: {
      account: account.id,
    },
    refetchQueries: [
      refetchListPhabricatorAccountsQuery(),
    ],
  });

  let deleteAccount = useCallback(async () => {
    await resetStore();
    await deleteAccountMutation();
  }, [deleteAccountMutation, resetStore]);

  let onChangeQuery = useMemo(() => {
    return (query: string, enabled: boolean): void => {
      let enabledQueries = new Set(account.enabledQueries);
      if (enabled) {
        enabledQueries.add(query);
      } else {
        enabledQueries.delete(query);
      }

      void updateAccount({
        variables: {
          id: account.id,
          params: {
            url: null,
            apiKey: null,
            queries: [...enabledQueries],
          },
        },
      });
    };
  }, [account.enabledQueries, account.id, updateAccount]);

  return <SettingsPage
    heading={
      <>
        <ImageIcon icon={account.icon}/>
        <Heading className={classes.headingText}>Settings for {account.url}</Heading>
        <div className={classes.actions}>
          <IconButton onClick={deleteAccount}>
            <Icons.Delete/>
          </IconButton>
        </div>
      </>
    }
  >
    <SettingsListSection
      heading={<SubHeading>Queries</SubHeading>}
    >
      {
        queries.map((query: PhabricatorQuery) => <Query
          key={query.queryId}
          query={query}
          enabled={account.enabledQueries.includes(query.queryId)}
          onChangeQuery={onChangeQuery}
        />)
      }
    </SettingsListSection>
  </SettingsPage>;
});
