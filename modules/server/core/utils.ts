import { NotAuthenticatedError, RequestController } from "../utils";
import { User } from "./implementations";

export class CoreController extends RequestController {
  public get userId(): string | null {
    return (this.context.session?.userId as string | undefined) ?? null;
  }
}

export function Authenticated<A extends unknown[], R>(
  writable: boolean,
): MethodDecorator {
  return (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void => {
    let inner = descriptor.value as (...args: A) => Promise<R>;

    descriptor.value = async function (
      this: CoreController,
      ...args: A
    ): Promise<R> {
      if (!this.userId) {
        throw new NotAuthenticatedError();
      }

      let tx = await this.startTransaction(writable);
      let user = await User.store(tx).findOne({ id: this.userId });
      if (user) {
        // @ts-ignore
        return inner.call(this, tx, user, ...args);
      }

      throw new NotAuthenticatedError();
    };
  };
}

export function Administrator<A extends unknown[], R>(
  writable: boolean,
): MethodDecorator {
  return (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void => {
    let inner = descriptor.value as (...args: A) => Promise<R>;

    descriptor.value = async function (
      this: CoreController,
      ...args: A
    ): Promise<R> {
      if (!this.userId) {
        throw new NotAuthenticatedError();
      }

      let tx = await this.startTransaction(writable);
      let user = await User.store(tx).findOne({ id: this.userId });
      if (user?.isAdmin) {
        // @ts-ignore
        return inner.call(this, tx, user, ...args);
      }

      throw new NotAuthenticatedError();
    };
  };
}
