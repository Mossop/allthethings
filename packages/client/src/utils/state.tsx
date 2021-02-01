import {
  createContext,
  useContext as useReactContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Overwrite } from "@allthethings/utils";
import type { ListContextStateQuery } from "../schema/queries";
import { useListContextStateQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import type { BaseView, InboxView, TaskListView, View } from "./navigation";
import { viewToUrl, NavigationHandler } from "./navigation";
import type { ReactChildren, ReactResult } from "./types";

export type Project = Overwrite<Omit<Schema.Project, "taskList" | "sections" | "items">, {
  readonly parent: Project | null;
  readonly subprojects: readonly Project[];
}>;

export type User = Overwrite<Omit<Schema.User, "password" | "sections" | "items">, {
  readonly subprojects: readonly Project[];
  readonly projects: ReadonlyMap<string, Project>;
  readonly contexts: ReadonlyMap<string, Context>;
}>;

export type Context = Overwrite<Omit<Schema.Context, "user" | "sections" | "items">, {
  readonly projects: ReadonlyMap<string, Project>;
  readonly subprojects: readonly Project[];
}>;

export type Section = Overwrite<Schema.Section, {
  readonly items: Item[];
  readonly taskList: TaskList;
}>;

export type Item = Schema.Item;

export type TaskList = User | Project | Context;
export type ProjectRoot = User | Context;

export function isContext(taskList: TaskList): taskList is Context {
  return "stub" in taskList && !isProject(taskList);
}

export function isProject(taskList: TaskList): taskList is Project {
  return "parent" in taskList;
}

export function isUser(taskList: TaskList): taskList is User {
  return "email" in taskList;
}

const StateContext = createContext<View | null | undefined>(null);

export type NavigableView = {
  context?: Context | null;
} & (
  Omit<InboxView, keyof BaseView | "context"> |
  Omit<TaskListView, keyof BaseView | "context">
);

export function useUrl(view: NavigableView): URL {
  let currentView = useView();

  let newView = {
    user: currentView.user,
    context: currentView.context,
    ...view,
  };

  return viewToUrl(newView);
}

export function useMaybeView(): View | undefined | null {
  return useReactContext(StateContext);
}

export function useView(): View {
  let view = useMaybeView();
  if (!view) {
    throw new Error("App not initialized.");
  }
  return view;
}

export function useUser(): User {
  return useView().user;
}

export function useContexts(): ReadonlyMap<string, Context> {
  return useUser().contexts;
}

export function useProjectRoot(): ProjectRoot {
  let state = useView();
  return state.context ?? state.user;
}

export function useCurrentContext(): Context | null {
  let state = useView();
  return state.context ?? null;
}

type ArrayContents<T> = T extends readonly (infer R)[] ? R : never;
type UserState = NonNullable<ListContextStateQuery["user"]>;
type ContextState = ArrayContents<UserState["contexts"]>;
type ProjectData = ArrayContents<UserState["projects"]>;

function buildProjects(
  root: UserState | ContextState,
): Pick<User, "projects" | "subprojects"> {
  let projectMap = new Map(
    root.projects.map((data: ProjectData): [string, ProjectData] => {
      return [data.id, data];
    }),
  );

  let projects = new Map<string, Project>();

  let buildProjects = (
    list: readonly { id: string }[],
    parent: Project | null,
  ): readonly Project[] => {
    return list.map(({ id }: { id: string }): Project => {
      let data = projectMap.get(id);
      if (!data) {
        throw new Error("Unknown project.");
      }

      let project: Overwrite<Project, { subprojects: readonly Project[] }> = {
        ...data,
        parent,
        subprojects: [],
      };

      project.subprojects = buildProjects(data.subprojects, project);
      projects.set(project.id, project);

      return project;
    });
  };

  return {
    projects,
    subprojects: buildProjects(root.subprojects, null),
  };
}

export function buildItems(items: readonly Schema.Item[]): Item[] {
  return [...items];
}

export function buildSections(taskList: TaskList, sections: readonly Schema.Section[]): Section[] {
  return sections.map((section: Schema.Section): Section => ({
    ...section,
    items: buildItems(section.items),
    taskList,
  }));
}

export function StateListener({ children }: ReactChildren): ReactResult {
  let { data } = useListContextStateQuery();
  let [view, setView] = useState<View | null | undefined>(undefined);

  let navHandler = useMemo(() => new NavigationHandler(setView), []);

  let user = useMemo((): User | null => {
    if (!data?.user) {
      return null;
    }

    return {
      ...data.user,

      // eslint-disable-next-line @typescript-eslint/typedef
      contexts: new Map(data.user.contexts.map((context): [string, Context] => {
        return [context.id, {
          ...context,

          ...buildProjects(context),
        }];
      })),

      ...buildProjects(data.user),
    };
  }, [data]);

  useEffect(() => {
    return navHandler.watch(user);
  }, [navHandler, user]);

  return <StateContext.Provider value={view}>{children}</StateContext.Provider>;
}
