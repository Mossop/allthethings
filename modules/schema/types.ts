export interface Root {
  dummy: "Root";
}

export enum TaskController {
  Manual = "manual",
  ServiceList = "list",
  Service = "service",
}

export { RelativeDateTime, DateTimeOffset } from "../utils";
