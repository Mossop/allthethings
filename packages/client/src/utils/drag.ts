import type {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
  DragSourceHookSpec,
  DropTargetHookSpec,
} from "react-dnd";
import { useDrag as drag, useDrop as drop } from "react-dnd";

import type { Overwrite } from "@allthethings/utils";

import type { Project, Section } from "./state";

export enum DragType {
  Project = "project",
  Section = "section",
}

export interface DraggedProject {
  type: DragType.Project;
  project: Project;
}

export interface DraggedSection {
  type: DragType.Section;
  section: Section;
}

export type DraggedObject = DraggedProject | DraggedSection;

export function useDrag<CollectedProps>(
  spec: DragSourceHookSpec<DraggedObject, unknown, CollectedProps>,
): [CollectedProps, ConnectDragSource, ConnectDragPreview] {
  return drag<DraggedObject, unknown, CollectedProps>(spec);
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
