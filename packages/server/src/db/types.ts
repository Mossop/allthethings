/* eslint-disable */
import type { Maybe } from "../schema/types";

export type UserDbObject = {
  id: string,
  email: string,
  password: string,
};

export type ContextDbObject = {
  id: string,
  user: UserDbObject['id'],
  stub: string,
  name: string,
};

export type ProjectDbObject = {
  id: string,
  stub: string,
  name: string,
  user: UserDbObject['id'],
  context: ContextDbObject['id'] | null,
  parent: ProjectDbObject['id'] | null,
};

export type SectionDbObject = {
  id: string,
  name: string,
  user: UserDbObject['id'],
  context: ContextDbObject['id'] | null,
  project: ProjectDbObject['id'] | null,
};
