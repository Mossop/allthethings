/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Ref } from "react";
import { useState, useMemo, useEffect, useRef, createContext, useContext } from "react";

import type { ReactResult, ReactChildren } from "#client/utils";
import { ReactMemo } from "#client/utils";

import type {
  GraphQLType,
  Project,
  Item,
  Section,
  TaskList,
  MoveProjectMutationVariables,
  MoveProjectMutation,
  MoveItemMutation,
  MoveItemMutationVariables,
  Inbox,
} from "../schema";
import {
  OperationNames,
  refetchQueriesForSection,
  isInbox,
  refetchQueriesForItem,
  MoveItemDocument,
  MoveProjectDocument,
  isTaskList,
  isProject,
  isSection,
  isItem,
  client as ApolloClient,
} from "../schema";
import { SharedState, useAsyncSharedState } from "./sharedstate";

interface BaseDrag {
  dragElement: HTMLElement;
  dropElement: HTMLElement | null;
}

type ProjectDrag = BaseDrag & {
  dragSource: Project;
  dropTarget: TaskList | null;
};

type SectionDrag = BaseDrag & {
  dragSource: Section;
  dropTarget: TaskList | null;
};

type ItemDrag = BaseDrag & {
  dragSource: Item;
  dropTarget: Section | TaskList | Inbox | null;
};

type Drag = ProjectDrag | SectionDrag | ItemDrag;

abstract class DragOperation {
  public abstract startDrag(): void;
  public abstract completeDrag(): Promise<void>;
  public abstract targetEnter(dropTarget: GraphQLType, dropElement: HTMLElement): void;
  public abstract targetLeave(): void;
}

abstract class BaseDragOperation<D extends Drag> {
  public constructor(
    protected readonly sharedState: SharedState<Drag | null>,
  ) {
    if (sharedState.value) {
      throw new Error("Illegal starting state.");
    }
  }

  protected get state(): D {
    if (!this.sharedState.value) {
      throw new Error("Illegal state.");
    }

    // @ts-ignore
    return this.sharedState.value;
  }

  protected set state(val: D | null) {
    this.sharedState.set(val);
  }
}

class ItemDragOperation extends BaseDragOperation<ItemDrag> {
  public constructor(
    private readonly dragSource: Item,
    state: SharedState<Drag | null>,
    private readonly baseState: BaseDrag,
  ) {
    super(state);
  }

  public startDrag(): void {
    this.state = {
      ...this.baseState,
      dragSource: this.dragSource,
      dropTarget: null,
    };
  }

  public async completeDrag(): Promise<void> {
    if (!this.state.dropTarget) {
      return;
    }

    await ApolloClient.mutate<MoveItemMutation, MoveItemMutationVariables>({
      mutation: MoveItemDocument,
      variables: {
        id: this.dragSource.id,
        section: isInbox(this.state.dropTarget) ? null : this.state.dropTarget.id,
        before: null,
      },
      refetchQueries: [
        ...refetchQueriesForItem(this.dragSource),
        ...refetchQueriesForSection(this.state.dropTarget),
      ],
    });

    return;
  }

  public targetEnter(dropTarget: GraphQLType, dropElement: HTMLElement): void {
    if (!isTaskList(dropTarget) && !isSection(dropTarget) && !isInbox(dropTarget)) {
      return this.targetLeave();
    }

    if (this.dragSource.parent === dropTarget) {
      return this.targetLeave();
    }

    this.state = {
      ...this.state,
      dropElement,
      dropTarget: dropTarget,
    };
  }

  public targetLeave(): void {
    this.state = {
      ...this.state,
      dropElement: null,
      dropTarget: null,
    };
  }
}

class ProjectDragOperation extends BaseDragOperation<ProjectDrag> {
  public constructor(
    private readonly dragSource: Project,
    state: SharedState<Drag | null>,
    private readonly baseState: BaseDrag,
  ) {
    super(state);
  }

  public startDrag(): void {
    this.state = {
      ...this.baseState,
      dragSource: this.dragSource,
      dropTarget: null,
    };
  }

  public async completeDrag(): Promise<void> {
    if (!this.state.dropTarget) {
      return;
    }

    await ApolloClient.mutate<MoveProjectMutation, MoveProjectMutationVariables>({
      mutation: MoveProjectDocument,
      variables: {
        id: this.dragSource.id,
        taskList: this.state.dropTarget.id,
      },
      refetchQueries: [
        OperationNames.Query.ListContextState,
      ],
    });
  }

  public targetEnter(dropTarget: GraphQLType, dropElement: HTMLElement): void {
    if (!isTaskList(dropTarget)) {
      return this.targetLeave();
    }

    if (this.dragSource.parent === dropTarget) {
      return this.targetLeave();
    }

    if (!this.dragSource.parent && !isProject(dropTarget)) {
      return this.targetLeave();
    }

    if (isProject(dropTarget)) {
      let project: Project | null = dropTarget;
      while (project) {
        if (project === this.dragSource) {
          return this.targetLeave();
        }
        project = project.parent;
      }
    }

    this.state = {
      ...this.state,
      dropElement,
      dropTarget: dropTarget,
    };
  }

  public targetLeave(): void {
    this.state = {
      ...this.state,
      dropElement: null,
      dropTarget: null,
    };
  }
}

class SectionDragOperation extends BaseDragOperation<SectionDrag> {
  public constructor(
    private readonly dragSource: Section,
    state: SharedState<Drag | null>,
    private readonly baseState: BaseDrag,
  ) {
    super(state);
  }

  public startDrag(): void {
    this.state = {
      ...this.baseState,
      dragSource: this.dragSource,
      dropTarget: null,
    };
  }

  public async completeDrag(): Promise<void> {
    return;
  }

  public targetEnter(dropTarget: GraphQLType, dropElement: HTMLElement): void {
    if (!isTaskList(dropTarget)) {
      return this.targetLeave();
    }

    if (dropTarget === this.dragSource.taskList) {
      return this.targetLeave();
    }

    this.state = {
      ...this.state,
      dropElement,
      dropTarget: dropTarget,
    };
  }

  public targetLeave(): void {
    this.state = {
      ...this.state,
      dropElement: null,
      dropTarget: null,
    };
  }
}

class DragManager {
  public readonly state: SharedState<Drag | null>;
  private operation: DragOperation | null;

  public constructor() {
    this.state = new SharedState<Drag | null>(null);
    this.operation = null;

    this.state.listen((val: Drag | null) => {
      if (!val) {
        this.operation = null;
      }
    });
  }

  public dragSourceStart(
    event: DragEvent,
    dragSource: GraphQLType,
    previewElement: HTMLElement | null,
  ): void {
    if (this.state.value) {
      console.warn("Starting a new drag while a drop operation is still running.");
      this.state.set(null);
    }

    if (!event.currentTarget || !(event.currentTarget instanceof HTMLElement)) {
      return;
    }

    let baseDrag: BaseDrag = {
      dragElement: event.currentTarget,
      dropElement: null,
    };

    if (isProject(dragSource)) {
      this.operation = new ProjectDragOperation(dragSource, this.state, baseDrag);
    } else if (isSection(dragSource)) {
      this.operation = new SectionDragOperation(dragSource, this.state, baseDrag);
    } else if (isItem(dragSource)) {
      this.operation = new ItemDragOperation(dragSource, this.state, baseDrag);
    } else {
      return;
    }

    if (previewElement) {
      let rect = previewElement.getBoundingClientRect();
      event.dataTransfer!.setDragImage(
        previewElement,
        event.clientX - rect.x,
        event.clientY - rect.y,
      );
    }

    event.dataTransfer!.effectAllowed = "move";
    this.operation.startDrag();
  }

  public dragSourceEnd(event: DragEvent, dragSource: GraphQLType): void {
    let drag = this.state.value;

    if (!drag || !this.operation || drag.dragSource !== dragSource) {
      console.warn("Saw drag event which no drag operation is being tracked.", event.type);
      this.state.set(null);
      return;
    }

    if (drag.dropTarget && event.dataTransfer?.dropEffect !== "none") {
      event.preventDefault();
      event.stopPropagation();

      this.operation.completeDrag()
        .catch(
          (e: unknown) => console.error("Failed to complete drag operation", this.state.value, e),
        )
        .finally(() => this.state.set(null));
    } else {
      this.state.set(null);
    }
  }

  public dropTargetEnter(event: DragEvent, dropTarget: GraphQLType): void {
    let drag = this.state.value;

    if (!drag || !this.operation) {
      console.warn("Saw drag event which no drag operation is being tracked.", event.type);
      return;
    }

    if (!event.currentTarget || !(event.currentTarget instanceof HTMLElement)) {
      return;
    }

    this.operation.targetEnter(dropTarget, event.currentTarget);

    if (this.state.value?.dropTarget) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer!.dropEffect = "move";
    }
  }

  public dropTargetOver(event: DragEvent, dropTarget: GraphQLType): void {
    let drag = this.state.value;

    if (!drag || !this.operation) {
      console.warn("Saw drag event which no drag operation is being tracked.", event.type);
      return;
    }

    if (drag.dropTarget !== dropTarget) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = "move";
  }

  public dropTargetLeave(event: DragEvent, dropTarget: GraphQLType): void {
    let drag = this.state.value;

    if (!drag || !this.operation) {
      console.warn("Saw drag event which no drag operation is being tracked.", event.type);
      return;
    }

    if (drag.dropTarget !== dropTarget) {
      return;
    }

    if (!event.currentTarget || !(event.currentTarget instanceof Element)) {
      return;
    }

    if (event.relatedTarget) {
      if (!(event.relatedTarget instanceof Node)) {
        return;
      }

      if (event.currentTarget.contains(event.relatedTarget)) {
        return;
      }
    }

    this.operation.targetLeave();
  }

  public dropTargetDrop(event: DragEvent, dropTarget: GraphQLType): void {
    if (this.state.value?.dropTarget !== dropTarget) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = "move";
  }
}

const ReactContext = createContext<DragManager | null>(null);

export const DragContext = ReactMemo(function DragContext({
  children,
}: ReactChildren): ReactResult {
  let manager = useMemo(() => new DragManager(), []);

  return <ReactContext.Provider value={manager}>{children}</ReactContext.Provider>;
});

function useDragManager(): [DragManager, Drag | null] {
  let manager = useContext(ReactContext);
  if (!manager) {
    throw new Error("Attempt to use drag and drop outside of a DragContext.");
  }

  let [drag] = useAsyncSharedState(manager.state);
  return [manager, drag];
}

export function useDragState(): Drag | null {
  let [, state] = useDragManager();
  return state;
}

export interface DropTargetProps {
  isDropping: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dropRef: Ref<any>;
}

type EventSet<K extends keyof HTMLElementEventMap> = {
  [E in K]: (event: HTMLElementEventMap[E]) => void;
};

function registerEvents<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  events: EventSet<K>,
): () => void {
  for (let [type, listener] of Object.entries(events)) {
    // @ts-ignore
    element.addEventListener(type, listener);
  }

  return () => {
    for (let [type, listener] of Object.entries(events)) {
      // @ts-ignore
      element.removeEventListener(type, listener);
    }
  };
}

export function useDropTarget(dropTarget: GraphQLType): DropTargetProps {
  let [dropElement, dropRef] = useState<HTMLElement | null>(null);

  let [manager, drag] = useDragManager();

  useEffect(() => {
    if (!dropElement) {
      // Element hasn't mounted yet.
      return;
    }

    return registerEvents(dropElement, {
      dragenter: (event: DragEvent) => manager.dropTargetEnter(event, dropTarget),
      dragover: (event: DragEvent) => manager.dropTargetOver(event, dropTarget),
      dragleave: (event: DragEvent) => manager.dropTargetLeave(event, dropTarget),
      drop: (event: DragEvent) => manager.dropTargetDrop(event, dropTarget),
    });
  }, [manager, dropTarget, dropElement]);

  return {
    isDropping: dropElement ? drag?.dropElement === dropElement : false,
    dropRef,
  };
}

export interface DragSource {
  isDragging: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previewRef: Ref<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragRef: Ref<any>;
}

export function useDragSource(dragSource: GraphQLType): DragSource {
  let previewRef = useRef<HTMLElement>(null);
  let [dragElement, dragRef] = useState<HTMLElement | null>(null);

  let [manager, drag] = useDragManager();

  useEffect(() => {
    if (!dragElement) {
      // Element hasn't mounted yet.
      return;
    }

    dragElement.setAttribute("draggable", "true");
    return registerEvents(dragElement, {
      dragstart: (
        event: DragEvent,
      ) => manager.dragSourceStart(event, dragSource, previewRef.current),
      dragend: (event: DragEvent) => manager.dragSourceEnd(event, dragSource),
    });
  }, [manager, dragSource, dragElement]);

  return {
    isDragging: dragElement ? drag?.dragElement === dragElement : false,
    dragRef,
    previewRef,
  };
}
