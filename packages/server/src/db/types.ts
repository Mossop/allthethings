/* eslint-disable */
import type { Maybe } from "../schema/types";
import { ObjectID } from 'mongodb';
export type UserDbObject = {
  email: string,
  password: string,
  _id: ObjectID,
};

export type ContextDbObject = {
  _id: ObjectID,
  user: UserDbObject['_id'],
  stub: string,
  name: string,
};

export type ProjectDbObject = {
  _id: ObjectID,
  user: UserDbObject['_id'],
  context: Maybe<ContextDbObject['_id']>,
  parent: Maybe<ProjectDbObject['_id']>,
  stub: string,
  name: string,
};
