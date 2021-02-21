import { List, createStyles, makeStyles } from "@material-ui/core";
import type { Theme } from "@material-ui/core";

import { InboxIcon } from "../components/Icons";
import ItemListActions from "../components/ItemListActions";
import { ItemList } from "../components/SectionList";
import { Heading } from "../components/Text";
import { useUser } from "../utils/state";
import { flexRow, pageStyles } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    outer: {
      flex: 1,
      position: "relative",
    },
    content: {
      ...pageStyles(theme),
      flex: 1,
    },
    heading: {
      ...flexRow,
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

  return <div className={classes.content}>
    <div className={classes.heading}>
      <InboxIcon/>
      <Heading className={classes.headingText}>Inbox</Heading>
      <ItemListActions list={user.inbox}/>
    </div>
    <List disablePadding={true}>
      <ItemList items={items} taskList={null} section={null}/>
    </List>
  </div>;
});
