export interface Problem {
  url: string;
  description: string;
}

export enum TaskController {
  Manual = "manual",
  ServiceList = "list",
  Service = "service",
}

export { RelativeDateTime, DateTimeOffset } from "#utils";
