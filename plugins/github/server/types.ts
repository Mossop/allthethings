import type { IssueFieldsFragment, PrFieldsFragment } from "./operations";

export interface GithubPluginConfig {
  clientId: string;
  clientSecret: string;
}

export type IssueApiResult = IssueFieldsFragment;
export type PrApiResult = PrFieldsFragment;

export type IssueLikeApiResult = IssueApiResult | PrApiResult;
