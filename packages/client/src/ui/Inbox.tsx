import type { ReactResult } from "@allthethings/ui";
import { ReactMemo, Icons, Styles, Heading } from "@allthethings/ui";
import { List, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";
import { useState } from "react";

import FilterMenu from "../components/FilterMenu";
import ItemListActions from "../components/ItemListActions";
import Page from "../components/Page";
import { ItemList } from "../components/SectionList";
import { useUser } from "../utils/state";
import { ListFilter } from "../utils/view";
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
      ...Styles.flexRow,
      alignItems: "center",
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

  let user = useUser();
  let items = user.inbox.items;

  let [filter, setFilter] = useState(() => ListFilter.Normal);

  return <Page sidebar={<ProjectList/>}>
    <div className={classes.content}>
      <div className={classes.heading}>
        <Icons.Inbox/>
        <Heading className={classes.headingText}>Inbox</Heading>
        <FilterMenu list={user.inbox} filter={filter} setFilter={setFilter}/>
        <ItemListActions list={user.inbox}/>
      </div>
      <List disablePadding={true}>
        <ItemList items={items} taskList={user.inbox} section={null} filter={filter}/>
      </List>
    </div>
  </Page>;
});
