import { type UseQueryResult } from '@tanstack/react-query';
import {
  type EndpointOutputType,
  type EndpointParamsType,
  type EndpointQueryType,
  type EndpointsMapType,
  type InferEndpointParams,
  type IOError,
  type PartialSerializedType,
  type serializedType,
  type InferEndpointInstanceParams,
  type MinimalEndpointInstance,
  type runtimeType,
} from '@ts-endpoint/core';
import { type GetListFnParamsE } from '@ts-endpoint/react-admin';
import { type API, type EndpointREST } from '@ts-endpoint/resource-client';

export type QueryFnKey<P, Q = undefined> = [string, P, Q | undefined, boolean];
export type GetKeyFn<P, Q = undefined> = (
  p: P,
  q?: Q,
  discrete?: boolean,
  prefix?: string
) => QueryFnKey<P, Q>;

export type QueryPromiseFunction<P, Q, A> = (
  params: P,
  query?: Q,
  discrete?: boolean
) => Promise<A>;

export interface ResourceQuery<P, Q, A> {
  getKey: GetKeyFn<P, Q>;
  fetch: QueryPromiseFunction<P, Q, A>;
  useQuery: (p: P, q?: Q, discrete?: boolean, prefix?: string) => UseQueryResult<A, IOError>;
}

export interface ResourceQueries<
  G extends MinimalEndpointInstance,
  L extends MinimalEndpointInstance,
  CC extends Record<string, MinimalEndpointInstance> | undefined,
> {
  get: ResourceQuery<
    EndpointParamsType<G>,
    PartialSerializedType<InferEndpointParams<G>['query']>,
    EndpointOutputType<G>
  >;
  list: ResourceQuery<GetListFnParamsE<L>, Partial<EndpointQueryType<L>>, EndpointOutputType<L>>;
  Custom: CC extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof CC]: ResourceQuery<
          runtimeType<InferEndpointInstanceParams<CC[K]>['params']> extends never
            ? undefined
            : runtimeType<InferEndpointInstanceParams<CC[K]>['params']>,
          Partial<serializedType<InferEndpointInstanceParams<CC[K]>['query']>>,
          EndpointOutputType<CC[K]>
        >;
      }
    : void;
}

export type ResourceQueryImpl<Q> =
  Q extends EndpointREST<
    infer G extends MinimalEndpointInstance,
    infer L extends MinimalEndpointInstance,
    infer _C extends MinimalEndpointInstance,
    infer _E extends MinimalEndpointInstance,
    infer _D extends MinimalEndpointInstance,
    infer CC
  >
    ? ResourceQueries<G, L, CC>
    : never;

export type QueryProvider<ES extends EndpointsMapType> = {
  [K in keyof ES]: ResourceQueryImpl<API<ES>[K]>;
};

export type GetQueryProviderImplAt<
  ES extends EndpointsMapType,
  K,
  KK = undefined,
> = K extends keyof QueryProvider<ES>
  ? KK extends keyof QueryProvider<ES>[K]['Custom']
    ? QueryProvider<ES>[K]['Custom'][KK]
    : QueryProvider<ES>[K]
  : never;
