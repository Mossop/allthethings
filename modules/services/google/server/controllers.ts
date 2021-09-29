import { Get, Route } from "@tsoa/runtime";

import { ServiceController } from "../../../server/utils";
import { map } from "../../../utils";
import { GoogleApi } from "./api";
import type { GoogleAccountState } from "./implementations";
import { Account } from "./implementations";

@Route()
export class MainController extends ServiceController {
  @Get("loginUrl")
  public async getLoginUrl(): Promise<string> {
    return GoogleApi.generateAuthUrl(this.serviceUrl, this.userId);
  }

  @Get("accounts")
  public async listAccounts(): Promise<GoogleAccountState[]> {
    let tx = await this.startTransaction(false);

    return map(
      Account.store(tx).find({ userId: this.userId }),
      (account: Account): Promise<GoogleAccountState> => account.state(),
    );
  }
}
