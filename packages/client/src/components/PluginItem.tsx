import type { ReactResult } from "@allthethings/ui";
import { usePlugin, ReactMemo } from "@allthethings/ui";
import type { Overwrite } from "@allthethings/utils";
import type { PureQueryOptions } from "@apollo/client";
import type { Theme } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";
import { useCallback } from "react";

import { refetchListContextStateQuery, refetchListTaskListQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import type { PluginItem } from "../utils/state";
import { isSection } from "../utils/state";
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
  list: Pick<Schema.PluginList, "name" | "url">;
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

  let refetchQueries = useCallback((): PureQueryOptions[] => [
    refetchListContextStateQuery(),
    refetchListTaskListQuery({
      taskList: isSection(item.parent) ? item.parent.taskList.id : item.parent.id,
    }),
  ], [item.parent]);

  if (!plugin) {
    return <div>Unknown plugin</div>;
  }

  return <>
    {
      plugin.renderItem({
        item,
        refetchQueries,
      })
    }
    {
      item.detail.lists.map((list: Schema.PluginList) => <PluginList
        key={list.id}
        list={list}
      />)
    }
  </>;
});
