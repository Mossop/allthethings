import type {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
  DragSourceHookSpec,
  DropTargetHookSpec,
} from "react-dnd";
import { useDrag as drag, useDrop as drop } from "react-dnd";

import type { Project } from "./state";

export enum DragType {
  Project = "project",
}

export interface DraggedProject {
  type: DragType.Project;
  project: Project;
}

export type DraggedObject = DraggedProject;

export function useDrag<CollectedProps>(
  spec: DragSourceHookSpec<DraggedObject, unknown, CollectedProps>,
): [CollectedProps, ConnectDragSource, ConnectDragPreview] {
  return drag<DraggedObject, unknown, CollectedProps>(spec);
}

type DropSpec<DropResult, CollectedProps> = {
  accept: DragType | DragType[];
} & Omit<DropTargetHookSpec<DraggedObject, DropResult, CollectedProps>, "accept">;

export function useDrop<DropResult, CollectedProps>(
  spec: DropSpec<DropResult, CollectedProps>,
): [CollectedProps, ConnectDropTarget] {
  return drop<DraggedObject, DropResult, CollectedProps>(spec);
}
