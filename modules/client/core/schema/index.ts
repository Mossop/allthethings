export * from "./operations";
export * from "./contextState";
export * from "./inboxState";
export * from "./taskListState";
export * from "./client";

export interface GraphQLType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: string;
}
