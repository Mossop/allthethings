import {
  createContext,
  useContext as useReactContext,
  useEffect,
  useMemo,
  useState as useReactState,
} from "react";

import { useListContextStateQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import type { NavigableView, View } from "./navigation";
import { viewToUrl, NavigationHandler } from "./navigation";
import type { ReactChildren, ReactResult } from "./types";

export type Project = Pick<Schema.Project, "id" | "stub" | "name"> & {
  readonly baseUrl: string;
  readonly parent: Project | null;
  readonly subprojects: readonly Project[];
};

export type User = Pick<Schema.User, "id" | "email"> & {
  readonly baseUrl: string;
  readonly subprojects: readonly Project[];
  readonly namedContexts: readonly NamedContext[];
};

export type NamedContext = Pick<Schema.NamedContext, "id" | "stub" | "name"> & {
  readonly baseUrl: string;
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

export function useState(): View | null | undefined {
  return useReactContext(StateContext);
}

export function useUrl(view: NavigableView | null): URL {
  let currentView = useView();
  if (!currentView || !view) {
    return new URL("/", document.URL);
  }

  return viewToUrl(view, currentView);
}

export function useView(): View | null {
  return useState() ?? null;
}

export function useUser(): User | null {
  return useState()?.user ?? null;
}

export function useNamedContexts(): readonly NamedContext[] {
  return useUser()?.namedContexts ?? [];
}

export function useCurrentContext(): User | NamedContext | null {
  let state = useState();
  if (!state) {
    return null;
  }

  return state.selectedNamedContext ?? state.user;
}

export function useCurrentNamedContext(): NamedContext | null {
  let state = useState();
  return state?.selectedNamedContext ?? null;
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

function buildProjects(context: ContextData, baseUrl: string): readonly Project[] {
  let projectMap = new Map(
    context.projects.map((data: ProjectData): [string, ProjectData] => {
      return [data.id, data];
    }),
  );

  let buildProjects = (
    list: readonly { readonly id: string }[],
    baseUrl: string,
    parent: Project | null,
  ): readonly Project[] => {
    return list.map(({ id }: { id: string }): Project => {
      let data = projectMap.get(id);
      if (!data) {
        throw new Error("Unknown project.");
      }

      let projectUrl = `${baseUrl}${data.stub}/`;
      let project: Omit<Project, "subprojects"> & { subprojects: readonly Project[] } = {
        ...data,
        baseUrl: projectUrl,
        parent,
        subprojects: [],
      };

      project.subprojects = buildProjects(data.subprojects, projectUrl, project);

      return project;
    });
  };

  return buildProjects(context.subprojects, `${baseUrl}project/`, null);
}

export function StateListener({ children }: ReactChildren): ReactResult {
  let { loading, data } = useListContextStateQuery();
  let [view, setView] = useReactState<View | null | undefined>(undefined);

  let user = useMemo((): User | null => {
    if (!data?.user) {
      return null;
    }

    return {
      ...data.user,
      baseUrl: "/",

      // eslint-disable-next-line @typescript-eslint/typedef
      namedContexts: data.user.namedContexts.map((namedContext): NamedContext => {
        let baseUrl = `/context/${namedContext.stub}/`;
        return {
          ...namedContext,
          baseUrl,

          subprojects: buildProjects(namedContext, baseUrl),
        };
      }),

      subprojects: buildProjects(data.user, "/"),
    };
  }, [data]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setView(null);
      return;
    }

    return NavigationHandler.watchHistory(user, setView);
  }, [loading, user, setView]);

  return <StateContext.Provider value={view}>{children}</StateContext.Provider>;
}
