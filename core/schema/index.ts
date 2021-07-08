import type { IntrospectionQuery } from "graphql";

// eslint-disable-next-line import/extensions
import introspection from "./introspection.json";

export enum TaskController {
  Manual = "manual",
  PluginList = "list",
  Plugin = "plugin",
}

const introspectionData = introspection as unknown as IntrospectionQuery;
export { introspectionData };
