export enum TaskController {
  Manual = "manual",
  ServiceList = "list",
  Service = "service",
}

export interface Problem {
  url: string;
  description: string;
}
