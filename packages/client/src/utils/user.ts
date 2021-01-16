import { createContext, useContext } from "react";

import type * as Schema from "../schema/types";

export type User = Pick<Schema.User, "id" | "email">;

let userContext = createContext<User | null>(null);

export function useUser(): User {
  let user = useContext(userContext);
  if (!user) {
    throw new Error("Not logged in.");
  }

  return user;
}

export const UserProvider = userContext.Provider;
