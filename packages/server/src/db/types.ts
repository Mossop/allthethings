/* eslint-disable */
import type { Maybe } from "../schema/types";

export type UserDbObject = {
  id: string,
  email: string,
  password: string,
};

export type NamedContextDbObject = {
  id: string,
  user: UserDbObject['id'],
  stub: string,
  name: string,
};

export type ProjectDbObject = {
  id: string,
  stub: string,
  name: string,
  parent: ProjectDbObject['id'] | null,
  user: UserDbObject['id'],
  namedContext: NamedContextDbObject['id'] | null,
};
