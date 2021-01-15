/* eslint-disable */
import type { Maybe } from "../schema/types";
import { ObjectID } from 'mongodb';
export type UserDbObject = {
  _id: ObjectID,
  email: string,
  password: string,
};

export type NamedContextDbObject = {
  _id: ObjectID,
  user: UserDbObject['_id'],
  stub: string,
  name: string,
};

export type ProjectDbObject = {
  _id: ObjectID,
  user: UserDbObject['_id'],
  namedContext: Maybe<NamedContextDbObject['_id']>,
  parent: Maybe<ProjectDbObject['_id']>,
  stub: string,
  name: string,
};
