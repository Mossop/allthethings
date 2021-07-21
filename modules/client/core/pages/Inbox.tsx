import { List, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import { useEffect, useState } from "react";

import { useBoolState, ReactMemo, Icons, Styles, Heading } from "#client/utils";
import type { ReactResult } from "#client/utils";

import FilterMenu from "../components/FilterMenu";
import ItemListActions from "../components/ItemListActions";
import Page from "../components/Page";
import { ItemList } from "../components/SectionList";
import LinkDialog from "../dialogs/Link";
import { useInboxContents } from "../schema";
import { Filters } from "../utils/filter";
import { useUser } from "../utils/globalState";
import { replaceView, useLoggedInView, ViewType } from "../utils/view";

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

  let view = useLoggedInView();
  let [linkView] = useState(view.type == ViewType.AddLink ? view : null);
  let [showAddLinkDialog,, closeAddLinkDialog] = useBoolState(linkView !== null);

  let user = useUser();
  let items = useInboxContents().items;

  let [filter, setFilter] = useState(() => Filters.Normal);

  useEffect(() => {
    if (view.type == ViewType.AddLink) {
      replaceView({
        type: ViewType.Inbox,
      });
    }
  }, [view]);

  return <Page>
    <div className={classes.content}>
      <div className={classes.heading}>
        <Icons.Inbox/>
        <Heading className={classes.headingText}>Inbox</Heading>
        <FilterMenu list={user.inbox} filter={filter} setFilter={setFilter}/>
        <ItemListActions list={user.inbox}/>
      </div>
      <List disablePadding={true}>
        <ItemList items={items} filter={filter}/>
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
