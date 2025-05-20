import { useQuery } from '@tanstack/react-query';
import {
  type EndpointInstance,
  type EndpointOutputType,
  type EndpointParamsType,
  type EndpointQueryEncoded,
  type EndpointsMapType,
  type InferEndpointParams,
  type IOError,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
  type PartialSerializedType,
  type TypeOfEndpointInstanceInput,
} from '@ts-endpoint/core';
import { type EndpointRequest, type EndpointREST } from '@ts-endpoint/resource-client';
import * as R from 'fp-ts/lib/Record.js';
import * as Rec from 'fp-ts/lib/Record.js';
import { type TaskEither } from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import {
  type GetQueryOverride,
  type ResourceEndpointsQueriesOverride,
} from './QueryProviderOverrides.js';
import {
  type GetKeyFn,
  type QueryFnKey,
  type QueryPromiseFunction,
  type ResourceQueries,
  type ResourceQuery,
} from './types.js';

export const throwTE = async <E, A>(te: TaskEither<E, A>): Promise<A> => {
  return te().then((rr) => {
    if (rr._tag === 'Left') {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(rr.left);
    }
    return Promise.resolve(rr.right);
  });
};

export const getDefaultKey =
  (key: string) =>
  <P, Q>(p: P, q?: Q, d?: boolean, prefix?: string): QueryFnKey<P, Q> => [
    `${prefix ? `${prefix}-` : ''}${key}`,
    p,
    q ?? undefined,
    d ?? false,
  ];

export const emptyQuery = (): Promise<any> =>
  Promise.resolve({
    data: [],
    total: 0,
  });

export type FetchQuery<FN extends (...args: any[]) => Promise<any>> = FN extends (
  p: infer P,
  q: infer Q,
  discrete: boolean
) => Promise<infer O>
  ? (p: P, q?: Q, discrete?: boolean) => Promise<O>
  : never;

export const fetchQuery =
  <P, Q, R>(fetch: (p: P, q?: Q) => TaskEither<IOError, R>) =>
  async (params: any, query?: any, discrete?: boolean): Promise<R> => {
    if (discrete) {
      if (R.isEmpty(params.filter) || (params.filter?.ids && params.filter?.ids.length === 0)) {
        return emptyQuery();
      }
    }

    return pipe(fetch(params, query), throwTE);
  };

const toGetResourceQuery = <G extends MinimalEndpointInstance>(
  getFn: EndpointRequest<G>,
  key: string,
  override?: GetQueryOverride<
    EndpointParamsType<G>,
    PartialSerializedType<InferEndpointParams<G>['query']>
  >
): ResourceQuery<
  EndpointParamsType<G>,
  PartialSerializedType<InferEndpointParams<G>['query']>,
  EndpointOutputType<G>
> => {
  const getKey = override?.getKey ?? getDefaultKey(key);
  const fetch: QueryPromiseFunction<
    EndpointParamsType<G>,
    PartialSerializedType<InferEndpointParams<G>['query']>,
    EndpointOutputType<G>
  > = (params, query) => {
    return pipe(getFn({ Params: params ?? {}, Query: query } as any), throwTE);
  };
  return {
    getKey,
    fetch,
    useQuery: (p, q, d, prefix) => {
      const qKey = getKey(p, q, d, prefix);
      return useQuery({
        queryKey: qKey,
        queryFn: ({ queryKey }) => fetch(queryKey[1], queryKey[2], !!queryKey[3]),
      });
    },
  };
};

export const toGetListResourceQuery = <L extends MinimalEndpointInstance>(
  getListFn: EndpointRequest<L>,
  key: string,
  override?: GetQueryOverride<EndpointParamsType<L>, Partial<EndpointQueryEncoded<L>>>
): ResourceQuery<
  EndpointParamsType<L>,
  Partial<EndpointQueryEncoded<L>>,
  EndpointOutputType<L>
> => {
  const getKey: GetKeyFn<
    EndpointParamsType<L>,
    Partial<EndpointQueryEncoded<L>>
  > = override?.getKey ?? getDefaultKey(key);

  const fetch: QueryPromiseFunction<
    EndpointParamsType<L>,
    Partial<EndpointQueryEncoded<L>>,
    EndpointOutputType<L>
  > = fetchQuery<EndpointParamsType<L>, Partial<EndpointQueryEncoded<L>>, EndpointOutputType<L>>(
    (p, q) => {
      return getListFn({
        Params: p,
        Query: q,
      } as TypeOfEndpointInstanceInput<L>);
    }
  );
  return {
    getKey,
    fetch,
    useQuery: (p, q, d, prefix) => {
      const qKey = getKey(p, q, d, prefix);

      return useQuery({
        queryKey: qKey,
        queryFn: ({ queryKey }) => fetch(queryKey[1], queryKey[2], !!queryKey[3]),
      });
    },
  };
};

export const toQueries = <
  ES extends EndpointsMapType,
  G extends MinimalEndpointInstance,
  L extends MinimalEndpointInstance,
  CC extends Record<string, MinimalEndpointInstance>,
>(
  key: string,
  e: EndpointREST<G, L, any, any, any, CC>,
  override?: ResourceEndpointsQueriesOverride<ES, G, L, CC>
): ResourceQueries<G, L, CC> => {
  const get = toGetResourceQuery<G>(e.Get, key, override?.get);
  const list = toGetListResourceQuery<L>(e.List, key, override?.list);

  const Custom = pipe(
    (e.Custom ?? {}) as Record<string, EndpointRequest<EndpointInstance<MinimalEndpoint>>>,
    Rec.mapWithIndex((index, ee) => {
      const getKey = getDefaultKey(`${key}-${index}`);
      const fetch = fetchQuery<any, any, any>((p, q) => {
        return ee({ Params: p, Query: q, Headers: {}, Body: undefined });
      });

      return {
        getKey,
        fetch,
        useQuery: (p: any, q: any, d: any, prefix: any) => {
          const qKey = getKey(p, q, d, prefix);
          return useQuery({
            queryKey: qKey,
            queryFn: ({ queryKey }) => {
              return fetch(queryKey[1], queryKey[2], !!queryKey[3]);
            },
          });
        },
      };
    })
  ) as ResourceQueries<G, L, CC>['Custom'];

  return {
    get,
    list,
    Custom,
  };
};
