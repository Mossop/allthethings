import type {
  MutationChangePasswordArgs,
  MutationCreateUserArgs,
  MutationDeleteUserArgs,
} from "../../schema";
import type { GraphQLCtx, Transaction, TypeResolver } from "../utils";
import { User } from "./implementations";
import type { MutationResolvers } from "./schema";
import { ensureAdmin, ensureAuthed } from "./utils";

const mutationResolvers: TypeResolver<MutationResolvers, GraphQLCtx> = {
  createUser: ensureAdmin(
    async (
      tx: Transaction,
      user: User,
      { email, password, isAdmin }: MutationCreateUserArgs,
    ): Promise<User> => {
      return User.create(tx, {
        email,
        password,
        isAdmin: isAdmin ?? false,
      });
    },
  ),

  deleteUser: ensureAdmin(
    async (
      tx: Transaction,
      user: User,
      { id }: MutationDeleteUserArgs,
    ): Promise<boolean> => {
      // TODO allow users to delete themselves.
      let targetUser = await User.store(tx).get(id ?? user.id);
      await targetUser.delete();
      return true;
    },
  ),

  changePassword: ensureAuthed(
    async (
      tx: Transaction,
      user: User,
      { currentPassword, newPassword }: MutationChangePasswordArgs,
    ): Promise<User | null> => {
      if (!(await user.verifyUser(currentPassword))) {
        return null;
      }

      await user.setPassword(newPassword);
      return user;
    },
  ),
};

export default mutationResolvers;
