import type { PluginContext } from "@allthethings/server";
import type { GraphQLResolver } from "@allthethings/utils";

import type {
  GoogleAccount,
} from "../schema";
import type { GoogleAccountRecord } from "./types";

export class Account implements GraphQLResolver<GoogleAccount> {
  public constructor(
    public readonly context: PluginContext,
    private readonly record: GoogleAccountRecord,
  ) {
  }

  public get id(): string {
    return this.record.id;
  }

  public get email(): string {
    return this.record.email;
  }
}
