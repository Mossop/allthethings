import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import type { Theme } from "@material-ui/core/styles";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import type { ReactElement } from "react";
import { useMemo, useCallback, useRef } from "react";
import type { DropTargetMonitor } from "react-dnd";
import mergeRefs from "react-merge-refs";

import { useEditSectionMutation } from "../schema/mutations";
import { indexOf, item } from "../utils/collections";
import type { DraggedItem, DraggedSection, ItemDragResult, SectionDragResult } from "../utils/drag";
import { useDragItem, DragType, useDragResult, useDropArea, useSectionDrag } from "../utils/drag";
import type { Item, Section, TaskList } from "../utils/state";
import { dragging, flexCentered, flexRow } from "../utils/styles";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import HiddenInput from "./HiddenInput";
import { SectionIcon } from "./Icons";
import ItemDisplay, { ItemDragMarker } from "./Item";
import ItemListActions from "./ItemListActions";
import { TextStyles, SubHeading } from "./Text";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      ...flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    dragging: {
      ...dragging,
    },
    hidden: {
      display: "none",
    },
    section: {
      paddingLeft: theme.spacing(2),
    },
    sectionHeading: {
      ...flexRow,
      alignItems: "center",
      color: theme.palette.text.primary,
      paddingBottom: theme.spacing(1),
      paddingTop: theme.spacing(1),
      borderTopWidth: 1,
      borderTopColor: theme.palette.divider,
      borderTopStyle: "solid",
    },
    sectionDragPreview: {
      ...flexRow,
      alignItems: "center",
    },
    sectionHeadingInput: TextStyles.subheading,
    sectionDragHeading: {
      padding: theme.spacing(1) + 2,
    },
  }));

export interface ItemListProps {
  taskList: TaskList;
  section: Section | null;
  items: Item[];
}

export const ItemList = ReactMemo(function ItemList({
  items,
  section,
  taskList,
}: ItemListProps): ReactResult {
  let dragItem = useDragItem(DragType.Item);
  let dragResult = useDragResult(DragType.Item);

  let displayItems = useMemo(() => {
    let displayItems = items.map(
      (item: Item, index: number): ReactElement => <ItemDisplay
        key={item.id}
        taskList={taskList}
        section={section}
        item={item}
        items={items}
        index={index}
      />,
    );

    if (dragItem && (dragResult?.target ?? dragItem.item.parent) == (section ?? taskList)) {
      let before = dragResult ? dragResult.before : dragItem.item;
      let index = before ? indexOf(items, before) ?? items.length : items.length;
      displayItems.splice(index, 0, <ItemDragMarker
        key="dragging"
        item={dragItem.item}
        section={section}
        taskList={taskList}
      />);
    }

    return displayItems;
  }, [dragItem, dragResult, items, section, taskList]);

  // @ts-ignore
  return displayItems;
});

interface SectionListProps {
  section: Section;
  index: number;
  sections: Section[];
}

export function SectionDragMarker({
  section,
}: Pick<SectionListProps, "section">): ReactResult {
  let classes = useStyles();

  let result = useDragResult(DragType.Section);

  let {
    dropRef,
  } = useDropArea([DragType.Section], {
    getDragResult: useCallback(
      () => result,
      [result],
    ),
  });

  return <List
    disablePadding={true}
    className={clsx(classes.section, classes.dragging)}
    ref={dropRef}
  >
    <ListSubheader
      disableGutters={true}
      className={clsx(classes.sectionHeading)}
    >
      <div className={classes.sectionDragPreview}>
        <div className={classes.icon}>
          <SectionIcon className={classes.dragHandle}/>
        </div>
        <SubHeading className={classes.sectionDragHeading}>{section.name}</SubHeading>
      </div>
    </ListSubheader>
  </List>;
}

export default ReactMemo(function SectionList({
  section,
  index,
  sections,
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

  let elementRef = useRef<Element>(null);

  let {
    dropRef: headingDropRef,
  } = useDropArea(DragType.Item, {
    getDragResult: useCallback(
      (draggedItem: DraggedItem): ItemDragResult | null => {
        if (draggedItem.item === section.items[0]) {
          return null;
        }

        return {
          type: DragType.Item,
          target: section,
          before: item(section.items, 0),
        };
      },
      [section],
    ),
  });

  let {
    dropRef: listDropRef,
  } = useDropArea(DragType.Section, {
    getDragResult: useCallback(
      (_: DraggedSection, monitor: DropTargetMonitor): SectionDragResult | null => {
        if (!elementRef.current) {
          return null;
        }

        let offset = monitor.getClientOffset();
        if (!offset) {
          return null;
        }

        let { top, bottom } = elementRef.current.getBoundingClientRect();
        let mid = (top + bottom) / 2;
        let { y } = offset;
        if (y < mid) {
          return {
            type: DragType.Section,
            taskList: section.taskList,
            before: section,
          };
        }

        return {
          type: DragType.Section,
          taskList: section.taskList,
          before: item(sections, index + 1),
        };
      },
      [section, sections, index],
    ),
  });

  let {
    dragRef,
    previewRef,
    isDragging,
  } = useSectionDrag(section);

  let sectionRef = mergeRefs([listDropRef, elementRef]);

  return <List
    disablePadding={true}
    className={clsx(classes.section, isDragging && classes.hidden)}
    ref={sectionRef}
  >
    <ListSubheader
      disableGutters={true}
      className={clsx(classes.sectionHeading)}
      ref={headingDropRef}
    >
      <div className={classes.sectionDragPreview} ref={previewRef}>
        <div className={classes.icon} ref={dragRef}>
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
    {section.items.length > 0 && <Divider/>}
    <ItemList items={section.items} section={section} taskList={section.taskList}/>
  </List>;
});