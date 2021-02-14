import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { useCallback } from "react";

import { useEditSectionMutation } from "../schema/mutations";
import type { DragOverCallback, DragState } from "../utils/drag";
import { DisplayState, useSectionDragState, DragType } from "../utils/drag";
import type { Item, Section } from "../utils/state";
import { dragging, flexCentered, flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import HiddenInput from "./HiddenInput";
import { SectionIcon } from "./Icons";
import ItemDisplay from "./Item";
import ItemListActions from "./ItemListActions";
import { TextStyles } from "./Text";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      ...flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    hidden: {
      display: "none",
    },
    dragging: {
      ...dragging,
    },
    section: {
      paddingLeft: theme.spacing(2),
    },
    sectionHeading: {
      ...flexRow,
      alignItems: "center",
      color: theme.palette.text.primary,
      paddingBottom: theme.spacing(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
      paddingTop: theme.spacing(1),
      borderTopWidth: 1,
      borderTopColor: theme.palette.divider,
      borderTopStyle: "solid",
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    sectionDragPreview: {
      ...flexRow,
      alignItems: "center",
    },
    sectionHeadingInput: TextStyles.subheading,
  }));

interface SectionListProps {
  section: Section;
  dragState: DragState;
  onDragOver: DragOverCallback;
}

export default ReactMemo(function SectionList({
  section,
  dragState,
  onDragOver,
}: SectionListProps): ReactResult {
  let classes = useStyles();

  let {
    displayState,
    dropRef,
    dragRef,
    previewRef,
  } = useSectionDragState(section, dragState, onDragOver);

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

  let items = section.items.map((item: Item) => <ItemDisplay
    key={item.id}
    taskList={section.taskList}
    section={section}
    item={item}
    dragState={dragState}
    onDragOver={onDragOver}
  />);
  if (dragState && dragState.type == DragType.Item && dragState.section === section) {
    items.splice(dragState.index, 0, <ItemDisplay
      key="dragging"
      taskList={section.taskList}
      section={section}
      item={dragState.item}
      dragState={dragState}
      onDragOver={onDragOver}
    />);
  }

  return <List
    disablePadding={true}
    className={clsx(classes.section, displayState == DisplayState.Hidden && classes.hidden)}
    ref={dropRef}
  >
    <ListSubheader
      disableGutters={true}
      className={
        clsx(
          classes.sectionHeading,
          displayState == DisplayState.Dragging && classes.dragging,
        )
      }
    >
      <div ref={previewRef} className={classes.sectionDragPreview}>
        <div
          className={classes.icon}
          ref={dragRef}
        >
          <SectionIcon className={classes.dragHandle}/>
        </div>
        <HiddenInput
          className={classes.sectionHeadingInput}
          initialValue={section.name}
          onSubmit={changeSectionName}
        />
      </div>
      <ItemListActions list={section}/>
    </ListSubheader>
    {items}
  </List>;
});
