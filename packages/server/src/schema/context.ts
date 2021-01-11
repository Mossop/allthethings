import type Koa from "koa";

export interface ResolverContext {
}

export function buildContext(_ctx: Koa.Context): ResolverContext {
  return {};
}
