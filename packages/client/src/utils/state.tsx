import {
  createContext,
  useContext as useReactContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Overwrite } from "../../../utils";
import type { ListContextStateQuery } from "../schema/queries";
import { useListContextStateQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import type { BaseView, InboxView, OwnerView, View } from "./navigation";
import { viewToUrl, NavigationHandler } from "./navigation";
import type { ReactChildren, ReactResult } from "./types";

export type Project = Overwrite<Omit<Schema.Project, "context" | "owner">, {
  readonly parent: Project | null;
  readonly subprojects: readonly Project[];
  readonly sections: readonly Section[];
}>;

export type User = Overwrite<Omit<Schema.User, "context" | "user" | "password">, {
  readonly subprojects: readonly Project[];
  readonly projects: ReadonlyMap<string, Project>;
  readonly namedContexts: ReadonlyMap<string, NamedContext>;
  readonly sections: readonly Section[];
}>;

export type NamedContext = Overwrite<Omit<Schema.NamedContext, "context" | "user">, {
  readonly projects: ReadonlyMap<string, Project>;
  readonly subprojects: readonly Project[];
  readonly sections: readonly Section[];
}>;

export type Section = Overwrite<Omit<Schema.Section, "owner">, {
}>;

export function isNamedContext(owner: User | NamedContext | Project): owner is NamedContext {
  return "stub" in owner && !isProject(owner);
}

export function isProject(owner: User | NamedContext | Project): owner is Project {
  return "parent" in owner;
}

export function isUser(owner: User | NamedContext | Project): owner is User {
  return "email" in owner;
}

const StateContext = createContext<View | null | undefined>(null);

export type NavigableView = {
  namedContext?: NamedContext | null;
} & (
  Omit<InboxView, keyof BaseView | "namedContext"> |
  Omit<OwnerView, keyof BaseView | "namedContext">
);

export function useUrl(view: NavigableView): URL {
  let currentView = useView();

  let newView = {
    user: currentView.user,
    namedContext: currentView.namedContext,
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

export function useNamedContexts(): ReadonlyMap<string, NamedContext> {
  return useUser().namedContexts;
}

export function useCurrentContext(): User | NamedContext {
  let state = useView();
  return state.namedContext ?? state.user;
}

export function useCurrentNamedContext(): NamedContext | null {
  let state = useView();
  return state.namedContext ?? null;
}

type ArrayContents<T> = T extends readonly (infer R)[] ? R : never;
type UserState = NonNullable<ListContextStateQuery["user"]>;
type ContextState = ArrayContents<UserState["namedContexts"]>;
type ProjectData = ArrayContents<UserState["projects"]>;

function buildProjects(
  context: UserState | ContextState,
): Pick<User, "projects" | "subprojects" | "sections"> {
  let projectMap = new Map(
    context.projects.map((data: ProjectData): [string, ProjectData] => {
      return [data.id, data];
    }),
  );

  let projects = new Map<string, Project>();
  let sections: Section[] = [];

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
        sections: [],
      };

      project.subprojects = buildProjects(data.subprojects, project);
      projects.set(project.id, project);

      return project;
    });
  };

  return {
    projects,
    subprojects: buildProjects(context.subprojects, null),
    sections,
  };
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
      namedContexts: new Map(data.user.namedContexts.map((namedContext): [string, NamedContext] => {
        return [namedContext.id, {
          ...namedContext,

          ...buildProjects(namedContext),
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
