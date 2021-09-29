import type { IntrospectionQuery as Schema } from "graphql";

// eslint-disable-next-line import/extensions
import introspection from "./introspection.json";

const introspectionData = introspection as unknown as Schema;
export { introspectionData };

export * from "./schema";
export * from "./types";
