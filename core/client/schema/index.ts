export * from "./contextState";
export * from "./inboxState";
export * from "./taskListState";
export * from "./refetch";
export * from "./client";
export * from "./mutations";
export { refetchListContextStateQuery } from "./queries";

export interface GraphQLType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: string;
}
