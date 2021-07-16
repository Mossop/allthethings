import type {
  IssueFieldsFragment,
  LabelFieldsFragment,
  PrFieldsFragment,
  RepositoryFieldsFragment,
} from "./operations";

export interface GithubPluginConfig {
  clientId: string;
  clientSecret: string;
}

export type IssueApiResult = IssueFieldsFragment;
export type PrApiResult = PrFieldsFragment;

export type IssueLikeApiResult = IssueApiResult | PrApiResult;
export type RepositoryApiResult = RepositoryFieldsFragment;
export type LabelApiResult = LabelFieldsFragment;
