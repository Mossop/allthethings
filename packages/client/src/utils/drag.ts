import { useCallback, useMemo, useState } from "react";
import type {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
  DragSourceHookSpec,
  DragSourceMonitor,
  DropTargetHookSpec,
  DropTargetMonitor,
} from "react-dnd";
import { useDrag as drag, useDrop as drop } from "react-dnd";
import mergeRefs from "react-merge-refs";

import type { Overwrite } from "@allthethings/utils";

import { useMoveItemMutation, useMoveSectionMutation } from "../schema/mutations";
import { refetchListTaskListQuery } from "../schema/queries";
import type { Item, Project, ProjectEntries, Section, TaskList } from "./state";
import { isSection, isTaskList } from "./state";

export enum DragType {
  Project = "project",
  Section = "section",
  Item = "item",
}

export interface DraggedProject {
  type: DragType.Project;
  item: Project;
}

export interface DraggedSection {
  type: DragType.Section;
  item: Section;
}

export interface DraggedItem {
  type: DragType.Item;
  item: Item;
}

export type DraggedObject = DraggedProject | DraggedSection | DraggedItem;

export function useDrag<DropType extends DraggedObject, CollectedProps>(
  spec: DragSourceHookSpec<DropType, unknown, CollectedProps>,
): [CollectedProps, ConnectDragSource, ConnectDragPreview] {
  return drag<DropType, unknown, CollectedProps>(spec);
}

type DropSpec<DropType extends DraggedObject, DropResult, CollectedProps> = Overwrite<
  DropTargetHookSpec<DropType, DropResult, CollectedProps>,
  {
    accept: DropType["type"] | DropType["type"][];
  }
>;

export function useDrop<DropType extends DraggedObject, DropResult, CollectedProps>(
  spec: DropSpec<DropType, DropResult, CollectedProps>,
): [CollectedProps, ConnectDropTarget] {
  return drop<DropType, DropResult, CollectedProps>(spec);
}

export interface DraggedSectionState {
  type: DragType.Section;
  item: Section;
  index: number;
}

export interface DraggedItemState {
  type: DragType.Item;
  item: Item;
  section: Section | null;
  index: number;
}

export type DragState = DraggedSectionState | DraggedItemState | null;

export interface ProjectDragTarget {
  type: DragType.Project;
  taskList: TaskList;
}

export interface SectionDragTarget {
  type: DragType.Section;
  taskList: TaskList;
  before: Section | null;
}

export interface ItemDragTarget {
  type: DragType.Item;
  target: TaskList | Section;
  before: Item | null;
}

export function isProjectDragTarget(val: unknown): val is ProjectDragTarget {
  // @ts-ignore
  return val && typeof val == "object" && val.type == DragType.Project;
}

export function isSectionDragTarget(val: unknown): val is SectionDragTarget {
  // @ts-ignore
  return val && typeof val == "object" && val.type == DragType.Section;
}

export function isItemDragTarget(val: unknown): val is ItemDragTarget {
  // @ts-ignore
  return val && typeof val == "object" && val.type == DragType.Item;
}

type DragOverItemArgs = [item: DraggedItem, over: TaskList | Section | Item | null];
type DragOverSectionArgs = [item: DraggedSection | DraggedItem, over: TaskList | Section | null];
export interface DragOverCallback {
  (...args: DragOverItemArgs): void;
  (...args: DragOverSectionArgs): void;
}

function cannotDrop(): boolean {
  return false;
}

interface ItemDragState {
  displayState: DisplayState;
  dropRef: ConnectDropTarget;
  previewRef: ConnectDragPreview;
  dragRef: ConnectDragSource;
}

export function useItemDragState(
  item: Item,
  dragState: DragState,
  onDragOver: DragOverCallback,
): ItemDragState {
  let [displayState, setDisplayState] = useState(
    dragState?.item.id == item.id ? DisplayState.Dragging : DisplayState.Normal,
  );

  let [, dropRef] = useDrop({
    accept: DragType.Item,
    canDrop: cannotDrop,
    hover: useCallback(
      (draggedItem: DraggedItem, monitor: DropTargetMonitor): void => {
        if (!monitor.isOver({ shallow: true })) {
          return;
        }

        if (draggedItem.item.id == item.id) {
          return;
        }

        onDragOver(draggedItem, item);
      },
      [onDragOver, item],
    ),
  });

  let draggedItem = useMemo<DraggedItem>(() => ({
    type: DragType.Item,
    item,
  }), [item]);

  let [moveItem] = useMoveItemMutation();

  let [{ isDragging }, dragRef, previewRef] = useDrag({
    item: draggedItem,

    begin: useCallback(
      (): void => {
        onDragOver(draggedItem, item);
      },
      [draggedItem, item, onDragOver],
    ),

    end: useCallback(
      async (_: unknown, monitor: DragSourceMonitor): Promise<void> => {
        if (monitor.didDrop()) {
          let target = monitor.getDropResult();
          if (isItemDragTarget(target)) {
            await moveItem({
              variables: {
                id: item.id,
                parent: target.target.id,
                before: target.before?.id ?? null,
              },
              refetchQueries: [
                refetchListTaskListQuery({
                  taskList: isSection(item.parent) ? item.parent.taskList.id : item.parent.id,
                }),
                refetchListTaskListQuery({
                  taskList: isSection(target.target) ? target.target.taskList.id : target.target.id,
                }),
              ],
            });
          } else {
            console.warn("Unknown drop result", target);
          }
        }

        setDisplayState(DisplayState.Normal);
        onDragOver(draggedItem, null);
      },
      [draggedItem, item.id, item.parent, moveItem, onDragOver],
    ),

    collect: useCallback(
      (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
      [],
    ),
  });

  if (isDragging && displayState == DisplayState.Normal) {
    displayState = DisplayState.Hidden;
  }

  return useMemo(() => ({
    displayState,
    dragRef,
    previewRef,
    dropRef,
  }), [dragRef, dropRef, displayState, previewRef]);
}

export enum DisplayState {
  Normal,
  Hidden,
  Dragging,
}

interface SectionDragState {
  displayState: DisplayState;
  dropRef: ConnectDropTarget;
  previewRef: ConnectDragPreview;
  dragRef: ConnectDragSource;
}

export function useSectionDragState(
  section: Section,
  dragState: DragState,
  onDragOver: DragOverCallback,
): SectionDragState {
  let [displayState, setDisplayState] = useState(
    dragState?.item.id == section.id ? DisplayState.Dragging : DisplayState.Normal,
  );

  let [moveSection] = useMoveSectionMutation();

  let [, dropRef] = useDrop({
    accept: [DragType.Section, DragType.Item],
    canDrop: cannotDrop,
    hover: useCallback(
      (draggedItem: DraggedSection | DraggedItem, monitor: DropTargetMonitor): void => {
        if (!monitor.isOver({ shallow: true })) {
          return;
        }

        if (draggedItem.item.id == section.id) {
          return;
        }

        onDragOver(draggedItem, section);
      },
      [onDragOver, section],
    ),
  });

  let draggedSection = useMemo<DraggedSection>(() => ({
    type: DragType.Section,
    item: section,
  }), [section]);

  let [{ isDragging }, dragRef, previewRef] = useDrag({
    item: draggedSection,

    begin: useCallback(
      (): void => {
        onDragOver(draggedSection, section);
      },
      [draggedSection, section, onDragOver],
    ),

    end: useCallback(
      async (_: unknown, monitor: DragSourceMonitor): Promise<void> => {
        if (monitor.didDrop()) {
          let target = monitor.getDropResult();
          if (isSectionDragTarget(target)) {
            await moveSection({
              variables: {
                id: section.id,
                taskList: target.taskList.id,
                before: target.before?.id ?? null,
              },
              refetchQueries: [
                refetchListTaskListQuery({
                  taskList: section.taskList.id,
                }),
                refetchListTaskListQuery({
                  taskList: target.taskList.id,
                }),
              ],
            });
          } else {
            console.warn("Unknown drop result", target);
          }
        }

        setDisplayState(DisplayState.Normal);
        onDragOver(draggedSection, null);
      },
      [draggedSection, moveSection, onDragOver, section.id, section.taskList.id],
    ),

    collect: useCallback(
      (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
      [],
    ),
  });

  if (isDragging && displayState == DisplayState.Normal) {
    displayState = DisplayState.Hidden;
  }

  return useMemo(() => ({
    displayState,
    dragRef,
    previewRef,
    dropRef,
  }), [displayState, dragRef, previewRef, dropRef]);
}

export interface DragManagerState {
  dragState: DragState;
  onDragOver: DragOverCallback;
  headerDropRef: ConnectDropTarget;
  dropRef: ConnectDropTarget;
}

function indexOf<T extends { id: string }>(items: T[], item: T | string): number | null {
  let id = typeof item == "string" ? item : item.id;
  let index = items.findIndex((item: T): boolean => item.id == id);
  return index < 0 ? null : index;
}

export function useTaskListDragManager(
  taskList: TaskList,
  entries: ProjectEntries,
): DragManagerState {
  let [dragState, setDragState] = useState<DragState>(null);

  let onDragOver = useCallback<DragOverCallback>(
    (...args: DragOverSectionArgs | DragOverItemArgs): void => {
      if (!args[1]) {
        setDragState(null);
        return;
      }

      if (args[0].type == DragType.Section) {
        let [item, over] = args as [DraggedSection, TaskList | Section];

        if (isTaskList(over)) {
          setDragState({
            type: DragType.Section,
            item: item.item,
            index: 0,
          });
        } else {
          let currentIndex = dragState?.index ?? indexOf(entries.sections, item.item);
          if (currentIndex === null) {
            console.warn("Unknown section being dragged.");
            setDragState(null);
            return;
          }
          let targetIndex = indexOf(entries.sections, over);
          if (targetIndex === null) {
            console.warn("Unknown target section during drag.");
            setDragState(null);
            return;
          }

          if (targetIndex >= currentIndex) {
            targetIndex++;
          }

          setDragState({
            type: DragType.Section,
            item: item.item,
            index: targetIndex,
          });
        }
      } else {
        let [item, over] = args as [DraggedItem, TaskList | Section | Item];

        if (isTaskList(over)) {
          setDragState({
            type: DragType.Item,
            item: item.item,
            section: null,
            index: 0,
          });
        } else if (isSection(over)) {
          setDragState({
            type: DragType.Item,
            item: item.item,
            section: over,
            index: 0,
          });
        } else {
          let targetSection = isSection(over.parent) ? over.parent : null;
          let targetItems = targetSection?.items ?? entries.items;
          let targetIndex = indexOf(targetItems, over);
          if (targetIndex === null) {
            console.warn("Unknown target item during drag.");
            setDragState(null);
            return;
          }

          let dragTargetItems = dragState?.type == DragType.Item
            ? dragState.section?.items ?? entries.items
            : null;
          let dragTargetIndex = dragState?.index ?? null;

          let currentItems = isSection(item.item.parent) ? item.item.parent.items : entries.items;
          let currentIndex = indexOf(currentItems, item.item);
          if (currentIndex === null) {
            console.warn("Unknown item being dragged.");
            setDragState(null);
            return;
          }

          console.log(currentIndex, targetIndex, currentItems === targetItems);

          if (currentItems === targetItems) {
            if (currentIndex <= targetIndex) {
              targetIndex++;
            }
          }

          if (dragState?.type == DragType.Item &&
              (dragState.section?.items ?? entries.items) === currentItems) {
          }

          setDragState({
            type: DragType.Item,
            item: item.item,
            index: targetIndex,
            section: targetSection,
          });
        }
      }
    },
    [dragState, entries],
  );

  let [, dropRef] = useDrop({
    accept: [DragType.Section, DragType.Item],

    canDrop: useCallback((): boolean => {
      if (!dragState) {
        return false;
      }

      if (dragState.type == DragType.Section) {
        if (dragState.index > 0 &&
            dragState.index <= entries.sections.length &&
            entries.sections[dragState.index - 1].id == dragState.item.id) {
          // Attempt to drop after self.
          return false;
        }

        if (dragState.index < entries.sections.length &&
            entries.sections[dragState.index].id == dragState.item.id) {
          // Attempt to drop on self.
          return false;
        }
      }

      return true;
    }, [entries, dragState]),

    drop: useCallback(
      (
        item: DraggedSection | DraggedItem,
        monitor: DropTargetMonitor,
      ): SectionDragTarget | ItemDragTarget | void => {
        if (monitor.didDrop() || !dragState) {
          return;
        }

        if (dragState.type == DragType.Section) {
          let before = dragState.index >= entries.sections.length
            ? null
            : entries.sections[dragState.index];

          return {
            type: DragType.Section,
            taskList: taskList,
            before,
          };
        }

        let target = dragState.section ?? taskList;
        let items = dragState.section?.items ?? entries.items;
        let before = dragState.index >= items.length
          ? null
          : items[dragState.index];

        return {
          type: DragType.Item,
          target,
          before,
        };
      },
      [entries, dragState, taskList],
    ),
  });

  let [, headerDropRef] = useDrop({
    accept: [DragType.Section, DragType.Item],
    canDrop: cannotDrop,
    hover: useCallback(
      (item: DraggedSection | DraggedItem, monitor: DropTargetMonitor): void => {
        if (!monitor.isOver({ shallow: true })) {
          return;
        }

        onDragOver(item, taskList);
      },
      [onDragOver, taskList],
    ),
  });

  return useMemo(() => ({
    dragState,
    onDragOver,
    dropRef,
    headerDropRef,
  }), [dragState, onDragOver, dropRef, headerDropRef]);
}
