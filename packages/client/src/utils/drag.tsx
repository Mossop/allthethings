import type { ReactChildren, ReactResult } from "@allthethings/ui";
import { ReactMemo } from "@allthethings/ui";
import type { PureQueryOptions } from "@apollo/client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
  ConnectDragSource,
  ConnectDragPreview,
  ConnectDropTarget,
  DragSourceMonitor,
  DropTargetMonitor,
} from "react-dnd";
import {
  useDrop,
  useDrag,
  DndProvider,
} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { Inbox, Project, TaskList, Item, Section } from "../schema";
import {
  isTaskList,
  useMoveItemMutation,
  useMoveProjectMutation,
  useMoveSectionMutation,
  refetchListContextStateQuery,
  isSection,
} from "../schema";
import { refetchListTaskListQuery } from "../schema/queries";

function shallowEqual<T>(a: T | null | undefined, b: T | null | undefined): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  if (typeof a != "object" || typeof b != "object") {
    return false;
  }

  for (let [key, value] of Object.entries(a)) {
    if (!(key in b)) {
      return false;
    }

    if (!Object.is(value, b[key])) {
      return false;
    }
  }

  for (let key of Object.keys(b)) {
    if (!(key in a)) {
      return false;
    }
  }

  return true;
}

export enum DragType {
  Project = "project",
  Section = "section",
  Item = "item",
}

export const AllDragTypes = Object.values(DragType);

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

export interface ProjectDragResult {
  type: DragType.Project;
  taskList: TaskList;
}

export interface SectionDragResult {
  type: DragType.Section;
  taskList: TaskList;
  before: Section | null;
}

export interface ItemDragResult {
  type: DragType.Item;
  target: Inbox | TaskList | Section;
  before: Item | null;
}

export type DragResult = ProjectDragResult | SectionDragResult | ItemDragResult;

interface DragTypes {
  [DragType.Item]: DraggedItem;
  [DragType.Section]: DraggedSection;
  [DragType.Project]: DraggedProject;
}

interface DragResults {
  [DragType.Item]: ItemDragResult;
  [DragType.Section]: SectionDragResult;
  [DragType.Project]: ProjectDragResult;
}

export function isProjectDragResult(val: unknown): val is ProjectDragResult {
  // @ts-ignore
  return val && typeof val == "object" && val.type == DragType.Project;
}

export function isSectionDragResult(val: unknown): val is SectionDragResult {
  // @ts-ignore
  return val && typeof val == "object" && val.type == DragType.Section;
}

export function isItemDragResult(val: unknown): val is ItemDragResult {
  // @ts-ignore
  return val && typeof val == "object" && val.type == DragType.Item;
}

interface DragProps {
  dragRef: ConnectDragSource;
  previewRef: ConnectDragPreview;
  isDragging: boolean;
}

function useDragBase(
  item: DraggedObject,
  handler: (result: DragResult) => Promise<void>,
): DragProps {
  let { setDragItem } = useDragCallbacks();
  let dragItem = useDragItem();

  let [, dragRef, previewRef] = useDrag({
    type: item.type,
    item,

    end: useCallback(
      async (_: unknown, monitor: DragSourceMonitor<DraggedObject, DragResult>): Promise<void> => {
        if (monitor.didDrop()) {
          let result = monitor.getDropResult();
          if (!result) {
            throw new Error("Expected a drop result.");
          }
          await handler(result);
        }

        setDragItem(null);
      },
      [handler, setDragItem],
    ),

    collect: useCallback(
      (monitor: DragSourceMonitor<DraggedObject, DragResult>): void => {
        if (monitor.isDragging() && dragItem !== item) {
          setDragItem(item);
        }
      },
      [setDragItem, dragItem, item],
    ),
  });

  return useMemo(() => ({
    isDragging: dragItem === item,
    dragRef,
    previewRef,
  }), [dragItem, dragRef, item, previewRef]);
}

export function useItemDrag(item: Item): DragProps {
  let draggedItem = useMemo<DraggedItem>(() => ({
    type: DragType.Item,
    item,
  }), [item]);

  let [moveItem] = useMoveItemMutation();

  return useDragBase(draggedItem, useCallback(
    async (target: unknown): Promise<void> => {
      if (isItemDragResult(target)) {
        let taskLists = new Set<string>();
        if (isSection(item.parent)) {
          taskLists.add(item.parent.taskList.id);
        } else if (isTaskList(item.parent)) {
          taskLists.add(item.parent.id);
        }

        if (isSection(target.target)) {
          taskLists.add(target.target.taskList.id);
        } else if (isTaskList(target.target)) {
          taskLists.add(target.target.id);
        }

        let refetchQueries = Array.from(taskLists.values(), (id: string): PureQueryOptions => {
          return refetchListTaskListQuery({
            taskList: id,
          });
        });

        await moveItem({
          variables: {
            id: item.id,
            parent: target.target.id,
            before: target.before?.id ?? null,
          },
          awaitRefetchQueries: true,
          refetchQueries: [
            refetchListContextStateQuery(),
            ...refetchQueries,
          ],
        });
      } else {
        console.warn("Unknown drop result", target);
      }
    },
    [item, moveItem],
  ));
}

export function useSectionDrag(section: Section): DragProps {
  let draggedItem = useMemo<DraggedSection>(() => ({
    type: DragType.Section,
    item: section,
  }), [section]);

  let [moveSection] = useMoveSectionMutation();

  return useDragBase(draggedItem, useCallback(
    async (target: unknown): Promise<void> => {
      if (isSectionDragResult(target)) {
        let taskLists = new Set<string>();
        taskLists.add(section.taskList.id);
        taskLists.add(target.taskList.id);

        let refetchQueries = Array.from(taskLists.values(), (id: string): PureQueryOptions => {
          return refetchListTaskListQuery({
            taskList: id,
          });
        });

        await moveSection({
          variables: {
            id: section.id,
            taskList: target.taskList.id,
            before: target.before?.id ?? null,
          },
          awaitRefetchQueries: true,
          refetchQueries: [
            refetchListContextStateQuery(),
            ...refetchQueries,
          ],
        });
      } else {
        console.warn("Unknown drop result", target);
      }
    },
    [section, moveSection],
  ));
}

export function useProjectDrag(project: Project): DragProps {
  let draggedItem = useMemo<DraggedProject>(() => ({
    type: DragType.Project,
    item: project,
  }), [project]);

  let [moveProject] = useMoveProjectMutation();

  return useDragBase(draggedItem, useCallback(
    async (target: unknown): Promise<void> => {
      if (isProjectDragResult(target)) {
        await moveProject({
          variables: {
            id: project.id,
            taskList: target.taskList.id,
          },
          awaitRefetchQueries: true,
          refetchQueries: [
            refetchListContextStateQuery(),
          ],
        });
      } else {
        console.warn("Unknown drop result", target);
      }
    },
    [moveProject, project],
  ));
}

interface DropAreaParams<T extends DragType> {
  getDragResult: (item: DragTypes[T], monitor: DropTargetMonitor) => DragResults[T] | null;
  hover?: (item: DragTypes[T], monitor: DropTargetMonitor) => void;
}

interface DropAreaProps {
  canDrop: boolean;
  isShallowOver: boolean;
  isOver: boolean;
  dropRef: ConnectDropTarget;
}

export function useDropArea<T extends DragType>(
  types: T | T[],
  {
    getDragResult,
    hover,
  }: DropAreaParams<T>,
): DropAreaProps {
  let { setDragResult } = useDragCallbacks();

  let dragResult = useDragResult();

  let [{ isOver, isShallowOver }, dropRef] = useDrop({
    accept: types,

    canDrop: useCallback(
      (item: DragTypes[T], monitor: DropTargetMonitor): boolean => {
        if (!monitor.isOver({ shallow: true })) {
          return false;
        }

        let result = getDragResult(item, monitor);
        setDragResult(result);
        return !!result;
      },
      [getDragResult, setDragResult],
    ),

    hover: useCallback(
      (item: DragTypes[T], monitor: DropTargetMonitor): void => {
        if (hover) {
          hover(item, monitor);
        }
      },
      [hover],
    ),

    collect: useCallback(
      (monitor: DropTargetMonitor): Omit<DropAreaProps, "dropRef" | "canDrop"> => {
        return {
          isShallowOver: monitor.isOver({ shallow: true }),
          isOver: monitor.isOver(),
        };
      },
      [],
    ),

    drop: useCallback(
      (item: DragTypes[T], monitor: DropTargetMonitor): DragResults[T] | null | void => {
        if (monitor.didDrop()) {
          return;
        }

        return getDragResult(item, monitor);
      },
      [getDragResult],
    ),
  });

  return useMemo(() => ({
    canDrop: isShallowOver && !!dragResult,
    isShallowOver,
    isOver,
    dropRef,
  }), [dragResult, dropRef, isShallowOver, isOver]);
}

interface DragCallbacks {
  setDragItem: (item: DraggedObject | null) => void;
  setDragResult: (result: DragResult | null) => void;
}

export function useDragCallbacks(): DragCallbacks {
  return useContext(DragCallbacksContext);
}

export function useDragItem<T extends DragType = DragType>(type?: T | T[]): DragTypes[T] | null {
  let dragState = useContext(DragStateContext);
  if (dragState?.draggedItem && type) {
    if (!Array.isArray(type)) {
      type = [type];
    }

    // @ts-ignore
    if (!type.includes(dragState.draggedItem.type)) {
      return null;
    }
  }

  // @ts-ignore
  return dragState?.draggedItem ?? null;
}

export function useDragResult<T extends DragType = DragType>(
  type?: T | T[],
): DragResults[T] | null {
  let dragState = useContext(DragStateContext);
  if (dragState?.dragResult && type) {
    if (!Array.isArray(type)) {
      type = [type];
    }

    // @ts-ignore
    if (!type.includes(dragState.dragResult.type)) {
      return null;
    }
  }

  // @ts-ignore
  return dragState?.dragResult ?? null;
}

const DragCallbacksContext = createContext<DragCallbacks>({
  setDragItem: () => {
  // No-op
  },
  setDragResult: () => {
  // No-op
  },
});

const DragStateContext = createContext<DragState | null>(null);

interface DragState {
  draggedItem: DraggedObject | null;
  dragResult: DragResult | null;
}

export const DragTracker = ReactMemo(
  function DragTracker({ children }: ReactChildren): ReactResult {
    let [state, setState] = useState<DragState | null>(null);

    let setDragItem = useCallback(
      (item: DraggedObject | null): void => {
        setState((state: DragState | null): DragState | null => {
          if (!item) {
            return null;
          }

          if (state?.draggedItem === item) {
            return state;
          }

          if (state?.draggedItem) {
            console.warn("Drag item changed mid-drag.");
          }

          return state
            ? {
              ...state,
              draggedItem: item,
            }
            : {
              draggedItem: item,
              dragResult: null,
            };
        });
      },
      [],
    );

    let setDragResult = useCallback(
      (result: DragResult | null): void => {
        setState((state: DragState | null): DragState | null => {
          if (state && shallowEqual(state.dragResult, result)) {
            return state;
          }

          if (state?.draggedItem && result && state.draggedItem.type != result.type) {
            throw new Error("Invalid drag result.");
          }

          return state
            ? {
              ...state,
              dragResult: result,
            }
            : {
              draggedItem: null,
              dragResult: result,
            };
        });
      },
      [],
    );

    let callbacks = useMemo(() => ({
      setDragItem,
      setDragResult,
    }), [setDragItem, setDragResult]);

    return <DndProvider backend={HTML5Backend}>
      <DragCallbacksContext.Provider value={callbacks}>
        <DragStateContext.Provider value={state}>
          {children}
        </DragStateContext.Provider>
      </DragCallbacksContext.Provider>
    </DndProvider>;
  },
);
