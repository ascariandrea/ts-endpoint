import { type UseQueryResult } from "@tanstack/react-query";
import {
  EndpointsMapType,
  type InferEndpointInstanceParams,
  type MinimalEndpointInstance,
} from "ts-endpoint";
import {
  type EndpointDataOutputType,
  type EndpointOutputType,
  type EndpointREST,
  type EndpointsRESTClient,
  type GetEndpointQueryType,
  type GetFnParams,
  type GetListFnParamsE,
} from "ts-endpoint-react-admin";
import { IOError, type runtimeType, serializedType } from "ts-io-error";

export type QueryFnKey<P, Q = undefined> = [string, P, Q | undefined, boolean];
export type GetKeyFn<P, Q = undefined> = (
  p: P,
  q?: Q,
  discrete?: boolean,
  prefix?: string,
) => QueryFnKey<P, Q>;

export type QueryPromiseFunction<P, Q, A> = (
  params: P,
  query?: Q,
  discrete?: boolean,
) => Promise<A>;

export interface ResourceQuery<P, Q, A> {
  getKey: GetKeyFn<P, Q>;
  fetch: QueryPromiseFunction<P, Q, A>;
  useQuery: (
    p: P,
    q?: Q,
    discrete?: boolean,
    prefix?: string,
  ) => UseQueryResult<A, IOError>;
}

export interface ResourceQueries<G, L, CC> {
  get: ResourceQuery<GetFnParams<G>, any, EndpointOutputType<G>>;
  list: ResourceQuery<
    GetListFnParamsE<L>,
    Partial<GetEndpointQueryType<L>>,
    EndpointOutputType<L>
  >;
  Custom: CC extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof CC]: ResourceQuery<
          runtimeType<
            InferEndpointInstanceParams<CC[K]>["params"]
          > extends never
            ? undefined
            : runtimeType<InferEndpointInstanceParams<CC[K]>["params"]>,
          Partial<serializedType<InferEndpointInstanceParams<CC[K]>["query"]>>,
          EndpointDataOutputType<CC[K]>
        >;
      }
    : never;
}

export type ResourceQueryImpl<Q> =
  Q extends EndpointREST<infer G, infer L, unknown, unknown, unknown, infer CC>
    ? ResourceQueries<G, L, CC>
    : never;

export type QueryProvider<ES extends EndpointsMapType> = {
  [K in keyof EndpointsRESTClient<ES>["Endpoints"]]: ResourceQueryImpl<
    EndpointsRESTClient<ES>["Endpoints"][K]
  >;
};

export type GetQueryProviderImplAt<
  ES extends EndpointsMapType,
  K,
  KK = undefined,
> = K extends keyof QueryProvider<ES>
  ? KK extends keyof QueryProvider<ES>[K]["Custom"]
    ? QueryProvider<ES>[K]["Custom"][KK]
    : QueryProvider<ES>[K]
  : never;
