import type { ReactResult } from "@allthethings/ui";
import { useBoolState, ReactMemo, Icons, Styles, Heading } from "@allthethings/ui";
import { List, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import { useEffect, useState } from "react";

import FilterMenu from "../components/FilterMenu";
import ItemListActions from "../components/ItemListActions";
import Page from "../components/Page";
import { ItemList } from "../components/SectionList";
import { useInboxContents } from "../schema";
import { Filters } from "../utils/filter";
import { replaceView, useView, ViewType } from "../utils/view";
import LinkDialog from "./LinkDialog";
import ProjectList from "./ProjectList";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    outer: {
      flex: 1,
      position: "relative",
    },
    content: {
      ...Styles.pageStyles(theme),
      flex: 1,
    },
    heading: {
      ...Styles.flexCenteredRow,
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
    },
    headingText: {
      padding: theme.spacing(1) + 2,
    },
  }));

export default ReactMemo(function Inbox(): ReactResult {
  let classes = useStyles();

  let view = useView();
  let [linkView] = useState(view.type == ViewType.AddLink ? view : null);
  let [showAddLinkDialog,, closeAddLinkDialog] = useBoolState(linkView !== null);

  let user = view.user;
  let items = useInboxContents().items;

  let [filter, setFilter] = useState(() => Filters.Normal);

  useEffect(() => {
    if (view.type == ViewType.AddLink) {
      replaceView({
        type: ViewType.Inbox,
      }, view);
    }
  }, [view]);

  return <Page sidebar={<ProjectList/>}>
    <div className={classes.content}>
      <div className={classes.heading}>
        <Icons.Inbox/>
        <Heading className={classes.headingText}>Inbox</Heading>
        <FilterMenu list={user.inbox} filter={filter} setFilter={setFilter}/>
        <ItemListActions list={user.inbox}/>
      </div>
      <List disablePadding={true}>
        <ItemList items={items} section={user.inbox} filter={filter}/>
      </List>
    </div>
    {
      linkView && showAddLinkDialog && <LinkDialog
        list={user.inbox}
        initialUrl={linkView.url}
        title={linkView.title}
        onClosed={closeAddLinkDialog}
      />
    }
  </Page>;
});
