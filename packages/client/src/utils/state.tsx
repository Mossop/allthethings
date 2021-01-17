import {
  createContext,
  useContext as useReactContext,
  useEffect,
  useMemo,
  useState as useReactState,
} from "react";

import { useListContextStateQuery } from "../schema/queries";
import type * as Schema from "../schema/types";
import type { View } from "./navigation";
import { NavigationHandler } from "./navigation";
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

export function isNamedContext(context: User | NamedContext): context is NamedContext {
  return "name" in context;
}

interface AppState {
  readonly user: User | null;
  readonly view: View | null;
}

const StateContext = createContext<AppState | null>(null);

export function useState(): AppState | null {
  return useReactContext(StateContext);
}

export function useView(): View | null {
  return useState()?.view ?? null;
}

export function useUser(): User | null {
  return useState()?.user ?? null;
}

export function useNamedContexts(): readonly NamedContext[] {
  return useState()?.user?.namedContexts ?? [];
}

export function useCurrentContext(): User | NamedContext | null {
  let state = useState();
  if (!state || !state.user || !state.view) {
    return null;
  }

  let { view: { selectedContext }, user } = state;
  if (!selectedContext) {
    return user;
  }

  return user.namedContexts.find(
    (context: NamedContext): boolean => context.id == selectedContext,
  ) ?? null;
}

export function useCurrentNamedContext(): NamedContext | null {
  let context = useCurrentContext();
  if (context && isNamedContext(context)) {
    return context;
  }

  return null;
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

      project.subprojects = buildProjects(data.subprojects, baseUrl, project);

      return project;
    });
  };

  return buildProjects(context.subprojects, `${baseUrl}project/`, null);
}

export function StateListener({ children }: ReactChildren): ReactResult {
  let { loading, data } = useListContextStateQuery();
  let [view, setView] = useReactState<View | null>(null);

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
    if (!user) {
      setView(null);
      return;
    }

    return NavigationHandler.watchHistory(user, setView);
  }, [user, setView]);

  let state = useMemo(() => {
    if (loading) {
      return null;
    }

    return {
      user,
      view,
    };
  }, [loading, user, view]);

  return <StateContext.Provider value={state}>{children}</StateContext.Provider>;
}
