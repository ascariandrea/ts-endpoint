import { useQuery } from '@tanstack/react-query';
import {
  EndpointParamsType,
  EndpointQueryType,
  EndpointsMapType,
  IOError,
  type InferEndpointInstanceParams,
  type MinimalEndpointInstance,
  type PartialSerializedType,
} from '@ts-endpoint/core';
import { type EndpointsRESTClient, type GetListFnParamsE } from '@ts-endpoint/react-admin';
import { API } from '@ts-endpoint/resource-client';
import * as Rec from 'fp-ts/lib/Record.js';
import { type TaskEither } from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { fetchQuery, getDefaultKey } from './GetQueries.js';
import { type GetKeyFn, type ResourceQueries } from './types.js';

export interface GetQueryOverride<P, Q = undefined> {
  getKey?: GetKeyFn<P, Q>;
  // transformParams?: (p: any) => any;
  // transformResult?: (r: any) => any;
}

export type CustomQueryOverride<ES extends EndpointsMapType, P, Q, O> = (
  q: EndpointsRESTClient<ES>['Endpoints']
) => (p: P, q: Q) => TaskEither<IOError, O>;

export interface ResourceEndpointsQueriesOverride<ES extends EndpointsMapType, G, L, CC> {
  get?: G extends MinimalEndpointInstance
    ? GetQueryOverride<
        EndpointParamsType<G>,
        PartialSerializedType<InferEndpointInstanceParams<G>['query']>
      >
    : never;
  list?: L extends MinimalEndpointInstance
    ? GetQueryOverride<GetListFnParamsE<L>, Partial<EndpointQueryType<L>>>
    : never;
  Custom?: {
    [K in keyof CC]: CC[K] extends CustomQueryOverride<ES, infer P, infer Q, infer O>
      ? CustomQueryOverride<ES, P, Q, O>
      : never;
  };
}

export type QueryProviderOverrides<ES extends EndpointsMapType, QO = Record<string, any>> = {
  [K in keyof QO]: QO[K] extends ResourceEndpointsQueriesOverride<ES, infer G, infer L, infer CC>
    ? ResourceEndpointsQueriesOverride<ES, G, L, CC>
    : never;
};

export const toOverrideQueries = <
  ES extends EndpointsMapType,
  G extends MinimalEndpointInstance,
  L extends MinimalEndpointInstance,
  CC extends Record<string, any>
>(
  QP: API<ES>,
  namespace: string,
  e: ResourceEndpointsQueriesOverride<ES, G, L, CC>
): Partial<ResourceQueries<G, L, CC>> => {
  return {
    // get: undefined,
    // list: undefined,
    Custom: pipe(
      e.Custom ?? {},
      Rec.mapWithIndex((key, ee) => {
        const getKey = getDefaultKey(`${namespace}-${key}`);
        const fetch = fetchQuery((p, q) => {
          return (ee as any)(QP)(p, q);
        });

        return {
          getKey,
          fetch,
          useQuery: (p: any) =>
            useQuery({
              queryKey: getKey(p),
              queryFn: ({ queryKey }) => {
                return fetch(queryKey[1], queryKey[2], !!queryKey[3]);
              },
            }),
        };
      })
    ) as any,
  };
};
