import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useCallback } from "react";

import HiddenInput from "../components/HiddenInput";
import { TextStyles } from "../components/Text";
import { useEditProjectMutation, useEditSectionMutation } from "../schema/mutations";
import { useListTaskListQuery } from "../schema/queries";
import type { Item } from "../schema/types";
import type { TaskListView } from "../utils/navigation";
import type { Section } from "../utils/state";
import { isProject } from "../utils/state";
import { pageStyles } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import AddDial from "./AddDial";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    outer: {
      flex: 1,
      position: "relative",
    },
    content: {
      ...pageStyles(theme),
      height: "100%",
      width: "100%",
    },
    heading: {
      paddingBottom: theme.spacing(2),
    },
    headingInput: TextStyles.heading,
    sectionHeadingInput: TextStyles.subheading,
    section: {
    },
    sectionHeading: {
    },
    floatingAction: {
      position: "absolute",
      bottom: theme.spacing(4),
      right: theme.spacing(4),
    },
  }));

interface SectionListProps {
  section: Section;
}

const SectionList = ReactMemo(function SectionList({
  section,
}: SectionListProps): ReactResult {
  let classes = useStyles();

  let [editSection] = useEditSectionMutation();

  let changeSectionName = useCallback((name: string): void => {
    void editSection({
      variables: {
        id: section.id,
        params: {
          name,
        },
      },
    });
  }, [section, editSection]);

  return <>
    <Divider/>
    <List>
      <ListSubheader>
        <HiddenInput
          className={classes.sectionHeadingInput}
          initialValue={section.name}
          onSubmit={changeSectionName}
        />
      </ListSubheader>
      {
        section.items.map((item: Item) => <ListItem key={item.id}>
          Foo
        </ListItem>)
      }
    </List>
  </>;
});

interface TaskListProps {
  view: TaskListView;
}

export default ReactMemo(function TaskList({
  view,
}: TaskListProps): ReactResult {
  let classes = useStyles();
  let { data } = useListTaskListQuery({
    variables: {
      taskList: view.taskList.id,
    },
  });

  let [editProject] = useEditProjectMutation();

  let changeTaskListName = useCallback((name: string): void => {
    void editProject({
      variables: {
        id: view.taskList.id,
        params: {
          name,
        },
      },
    });
  }, [editProject, view]);

  if (!data?.taskList) {
    return null;
  }

  let { taskList } = data;

  return <div className={classes.outer}>
    <div className={classes.content}>
      {
        isProject(view.taskList) &&
        <div className={classes.heading}>
          <HiddenInput
            className={classes.headingInput}
            initialValue={view.taskList.name}
            onSubmit={changeTaskListName}
          />
        </div>
      }
      <List>
        {
          taskList.items.map((item: Item) => <ListItem key={item.id}>
            Foo
          </ListItem>)
        }
        {
          taskList.sections.map((section: Section) => <SectionList
            key={section.id}
            section={section}
          />)
        }
      </List>
    </div>
    <div className={classes.floatingAction}>
      <AddDial viewType={view.type} taskList={view.taskList}/>
    </div>
  </div>;
});
