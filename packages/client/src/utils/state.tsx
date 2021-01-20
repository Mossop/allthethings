import {
  createContext,
  useContext as useReactContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useListContextStateQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import type { BaseView, InboxView, OwnerView, View } from "./navigation";
import { viewToUrl, NavigationHandler } from "./navigation";
import type { ReactChildren, ReactResult } from "./types";

export type Project = Pick<Schema.Project, "id" | "stub" | "name"> & {
  readonly parent: Project | null;
  readonly subprojects: readonly Project[];
};

export type User = Pick<Schema.User, "id" | "email"> & {
  readonly subprojects: readonly Project[];
  readonly projects: ReadonlyMap<string, Project>;
  readonly namedContexts: ReadonlyMap<string, NamedContext>;
};

export type NamedContext = Pick<Schema.NamedContext, "id" | "stub" | "name"> & {
  readonly projects: ReadonlyMap<string, Project>;
  readonly subprojects: readonly Project[];
};

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

export function useUrl(view: NavigableView | null): URL {
  let currentView = useView();
  if (!currentView || !view) {
    return new URL("/", document.URL);
  }

  let newView = {
    user: currentView.user,
    namedContext: currentView.namedContext,
    ...view,
  };

  return viewToUrl(newView);
}

export function useView(): View | undefined | null {
  return useReactContext(StateContext);
}

export function useUser(): User | null {
  return useView()?.user ?? null;
}

export function useNamedContexts(): ReadonlyMap<string, NamedContext> {
  return useUser()?.namedContexts ?? new Map();
}

export function useCurrentContext(): User | NamedContext | null {
  let state = useView();
  return state?.namedContext ?? state?.user ?? null;
}

export function useCurrentNamedContext(): NamedContext | null {
  let state = useView();
  return state?.namedContext ?? null;
}

interface ProjectData {
  readonly id: string,
  readonly stub: string,
  readonly name: string,
  readonly subprojects: readonly {
    readonly id: string
  }[]
}
interface ContextData {
  readonly subprojects: readonly {
    readonly id: string
  }[],
  readonly projects: readonly ProjectData[]
}

function buildProjects(context: ContextData): Pick<User, "projects" | "subprojects"> {
  let projectMap = new Map(
    context.projects.map((data: ProjectData): [string, ProjectData] => {
      return [data.id, data];
    }),
  );

  let projects = new Map<string, Project>();

  let buildProjects = (
    list: readonly { readonly id: string }[],
    parent: Project | null,
  ): readonly Project[] => {
    return list.map(({ id }: { id: string }): Project => {
      let data = projectMap.get(id);
      if (!data) {
        throw new Error("Unknown project.");
      }

      let project: Omit<Project, "subprojects"> & { subprojects: readonly Project[] } = {
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
    subprojects: buildProjects(context.subprojects, null),
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
