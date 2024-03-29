import { Divider, List, ListSubheader } from "@mui/material";
import type { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import type { ReactElement } from "react";
import { useCallback } from "react";

import { ReactMemo, HiddenInput, Icons, Styles, TextStyles } from "../../utils";
import type { ReactResult } from "../../utils";
import type { Item, Section } from "../schema";
import { useEditSectionMutation } from "../utils/api";
import { useDragSource } from "../utils/drag";
import type { ListFilter } from "../utils/filter";
import ItemDisplay from "./Item";
import ItemListActions from "./ItemListActions";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      ...Styles.flexCentered,
    },
    dragHandle: {
      cursor: "grab",
    },
    section: {
      paddingLeft: theme.spacing(2),
    },
    sectionHeading: {
      ...Styles.flexCenteredRow,
      color: theme.palette.text.primary,
      paddingBottom: theme.spacing(1),
      paddingTop: theme.spacing(1),
      borderTopWidth: 1,
      borderTopColor: theme.palette.divider,
      borderTopStyle: "solid",
    },
    sectionDragPreview: {
      ...Styles.flexCenteredRow,
    },
    sectionHeadingInput: TextStyles.subheading,
    sectionDragHeading: {
      padding: `calc(${theme.spacing(1)} + 2px)`,
    },
    dragging: Styles.dragging,
  }),
);

export interface ItemListProps {
  filter: ListFilter;
  items: Item[];
}

export const ItemList = ReactMemo(function ItemList({
  items,
  filter,
}: ItemListProps): ReactResult {
  return (
    <>
      {items.map(
        (item: Item): ReactElement => (
          <ItemDisplay key={item.id} item={item} filter={filter} />
        ),
      )}
    </>
  );
});

interface SectionListProps {
  section: Section;
  filter: ListFilter;
}

export default ReactMemo(function SectionList({
  section,
  filter,
}: SectionListProps): ReactResult {
  let classes = useStyles();

  let [editSection] = useEditSectionMutation();

  let changeSectionName = useCallback(
    (name: string): void => {
      void editSection({
        id: section.id,
        params: {
          name,
        },
      });
    },
    [section, editSection],
  );

  let { isDragging, dragRef, previewRef } = useDragSource(section);

  return (
    <List disablePadding={true} className={classes.section}>
      <ListSubheader
        disableGutters={true}
        className={clsx(classes.sectionHeading, isDragging && classes.dragging)}
      >
        <div className={classes.sectionDragPreview} ref={previewRef}>
          <div className={classes.icon} ref={dragRef}>
            <Icons.Section className={classes.dragHandle} />
          </div>
          <HiddenInput
            className={classes.sectionHeadingInput}
            initialValue={section.name}
            onSubmit={changeSectionName}
          />
        </div>
        <ItemListActions list={section} />
      </ListSubheader>
      {section.items.length > 0 && <Divider />}
      <ItemList items={section.items} filter={filter} />
    </List>
  );
});
