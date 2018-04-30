import {
  ApolloClient,
  ApolloQueryResult,
  MutationOptions,
  WatchQueryOptions,
} from 'apollo-client';
import { DocumentNode } from 'graphql';

export enum RequestType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  GET_ONE = 'GET_ONE',
  GET_LIST = 'GET_LIST',
  GET_MANY = 'GET_MANY',
  GET_MANY_REFERENCE = 'GET_MANY_REFERENCE',
}

export interface CreateParams {
  data: object;
}

export interface UpdateParams {
  id: any;
  data: object;
  previousData: object;
}

export interface DeleteParams {
  id: any;
  previousData: object;
}

export interface GetOneParams {
  id: any;
}

export interface GetListParams {
  pagination: {
    page: number;
    perPage: number;
  };
  sort: {
    field: string;
    order: string;
  };
  filter: object;
}

export interface GetManyParams {
  ids: any[];
}

export interface GetManyReferenceParams extends GetListParams {
  target: string;
  id: any;
}

export type RestParams =
  CreateParams |
  UpdateParams |
  DeleteParams |
  GetOneParams |
  GetListParams |
  GetManyParams |
  GetManyReferenceParams;

export interface GetOneResponse {
  data: object;
}

export interface GetListResponse {
  data: object[];
  total: number;
}

export interface GetManyResponse {
  data: object[];
}

export interface GetManyReferenceResponse {
  data: object[];
  total: number;
}

export type RestResponse =
  GetOneResponse |
  GetListResponse |
  GetManyResponse |
  GetManyReferenceResponse;

export interface RequestConfig {
  fields?: string;
  formatApolloVariables?(variables: any): any;
  sendApolloRequest?(variables: any): ApolloQueryResult<any>;
  parseApolloResult?(result: ApolloQueryResult<any>) : any;
}

export interface MutationConfig extends RequestConfig {
  dataInput?: string;
  exclude?: string[];
  include?: string[];
  mutation?: string | DocumentNode;
  mutationName?: string;
  mutationOptions?: MutationOptions;
  getMutationName(resourceName: string) : string;
}

export interface QueryConfig extends RequestConfig {
  query?: string | DocumentNode;
  queryName?: string;
  queryOptions?: WatchQueryOptions;
  getQueryName(resourceName: string) : string;
}

export interface ResourceConfig {
  resourceName?: string;
  primaryKey?: string;
  dataInput?: string;
  paginationInput: string;
  sortInput?: string;
  filterInput?: string;
  [RequestType.CREATE]?: MutationConfig;
  [RequestType.UPDATE]?: MutationConfig;
  [RequestType.DELETE]?: MutationConfig;
  [RequestType.GET_ONE]?: QueryConfig;
  [RequestType.GET_LIST]?: QueryConfig;
  [RequestType.GET_MANY]?: QueryConfig;
  [RequestType.GET_MANY_REFERENCE]?: QueryConfig;
}

export interface AorApolloClientResourceMap {
  [resourceName: string]: ResourceConfig;
}

export interface AorApolloClientOptions {
  apolloClient : ApolloClient<any>;
  resourceMap: AorApolloClientResourceMap;
  defaultResourceConfig: ResourceConfig;
}

export interface AorApolloClient extends Function {
  (requestType : RequestType, resourceName: string, restParams: RestParams) : Promise<any>;
}
