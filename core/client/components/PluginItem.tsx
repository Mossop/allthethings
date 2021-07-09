import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";
import { useCallback } from "react";

import type { ReactResult } from "#client-utils";
import { usePlugin, ReactMemo } from "#client-utils";
import type { Overwrite } from "#utils";

import { refetchQueriesForItem } from "../schema";
import type { PluginItem, PluginList as PluginListSchema } from "../schema";
import type { ItemRenderProps } from "./Item";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      borderRadius: 5,
      borderColor: theme.palette.text.primary,
      borderStyle: "solid",
      borderWidth: 1,
      padding: theme.spacing(0.5),
      marginLeft: theme.spacing(1),
      textTransform: "uppercase",
      fontSize: "0.7rem",
    },
    listLink: {
      cursor: "pointer",
    },
  }));

interface PluginListProps {
  list: Pick<PluginListSchema, "name" | "url">;
}

const PluginList = ReactMemo(function PluginList({
  list,
}: PluginListProps): ReactResult {
  let classes = useStyles();

  if (list.url) {
    return <div className={classes.list}>
      <a className={classes.listLink} href={list.url} target="_blank" rel="noreferrer">
        {list.name}
      </a>
    </div>;
  }

  return <div className={classes.list}>{list.name}</div>;
});

export type PluginItemProps = Overwrite<ItemRenderProps, {
  item: PluginItem;
}>;

export default ReactMemo(function PluginItem({
  item,
}: PluginItemProps): ReactResult {
  let plugin = usePlugin(item.detail.pluginId);

  let refetchQueries = useCallback(() => refetchQueriesForItem(item), [item]);

  if (!plugin) {
    return <div>Unknown plugin</div>;
  }

  return <>
    {
      plugin.renderItem({
        fields: item.detail.fields,
        refetchQueries,
      })
    }
    {
      item.detail.lists.map((list: PluginListSchema) => <PluginList
        key={list.id}
        list={list}
      />)
    }
  </>;
});
