import { promises as fs } from "fs";
import path from "path";

import { Route, Get, Query } from "tsoa";

import type { Transaction } from "#server/utils";
import { RequestController } from "#server/utils";

class CoreController extends RequestController {
  public get userId(): string | null {
    return (this.context.session?.userId as string | undefined) ?? null;
  }

  public startTransaction(writable: boolean): Promise<Transaction> {
    return this.context.startTransaction(writable);
  }
}

const pageRoot = path.normalize(
  path.join(__dirname, "..", "..", "..", "static", "pages"),
);

async function loadFile(name: string): Promise<string | null> {
  try {
    let content = await fs.readFile(name, {
      encoding: "utf8",
    });
    return content;
  } catch (e) {
    return null;
  }
}

@Route()
export class MainController extends CoreController {
  @Get("page")
  public async getPageContent(@Query("path") page: string): Promise<string> {
    let target: string;

    if (page.length > 1) {
      target = path.join(pageRoot, ...page.substring(1).split("/"));
    } else {
      target = path.normalize(path.join(pageRoot, "..", "..", "README"));
    }

    let content = await loadFile(target + ".md");
    if (content) {
      return content;
    }

    content = await loadFile(path.join(target, "index.md"));
    if (content) {
      return content;
    }

    throw new Error(`Unknown file: ${target}`);
  }
}
