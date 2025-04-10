import { useQuery } from '@tanstack/react-query';
import { pipe } from 'fp-ts/function';
import * as R from 'fp-ts/lib/Record.js';
import * as Rec from 'fp-ts/lib/Record.js';
import { type TaskEither } from 'fp-ts/lib/TaskEither.js';
import {
  EndpointsMapType,
  type InferEndpointParams,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
} from 'ts-endpoint';
import {
  type EndpointOutputType,
  type EndpointREST,
  type GetEndpointQueryType,
  type GetFn,
  type GetFnParams,
  type GetListFn,
  type GetListFnParamsE,
} from 'ts-endpoint-react-admin';
import { IOError, PartialSerializedType } from 'ts-io-error';
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
  <P, Q>(p: P, q?: Q, d?: boolean, prefix?: string): QueryFnKey<P, Q> =>
    [`${prefix ? `${prefix}-` : ''}${key}`, p, q ?? undefined, d ?? false];

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
  <P, Q, R>(q: (p: P, q?: Q) => TaskEither<IOError, R>) =>
  async (params: any, query?: any, discrete?: boolean): Promise<R> => {
    if (discrete) {
      if (R.isEmpty(params.filter) || (params.filter?.ids && params.filter?.ids.length === 0)) {
        return emptyQuery();
      }
    }

    return pipe(q(params, query), throwTE);
  };

const toGetResourceQuery = <G>(
  getFn: GetFn<G>,
  key: string,
  override?: GetQueryOverride<
    GetFnParams<G>,
    PartialSerializedType<InferEndpointParams<G>['query']>
  >
): ResourceQuery<
  GetFnParams<G>,
  PartialSerializedType<InferEndpointParams<G>['query']>,
  EndpointOutputType<G>
> => {
  const getKey = override?.getKey ?? getDefaultKey(key);
  const fetch: QueryPromiseFunction<
    GetFnParams<G>,
    PartialSerializedType<InferEndpointParams<G>['query']>,
    EndpointOutputType<G>
  > = (params, query) => {
    return pipe(getFn(params, query), throwTE);
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

export const toGetListResourceQuery = <L>(
  getListFn: GetListFn<L>,
  key: string,
  override?: GetQueryOverride<GetListFnParamsE<L>, Partial<GetEndpointQueryType<L>>>
): ResourceQuery<GetListFnParamsE<L>, Partial<GetEndpointQueryType<L>>, EndpointOutputType<L>> => {
  const getKey: GetKeyFn<
    GetListFnParamsE<L>,
    Partial<GetEndpointQueryType<L>>
  > = override?.getKey ?? getDefaultKey(key);

  const fetch: QueryPromiseFunction<
    GetListFnParamsE<L>,
    Partial<GetEndpointQueryType<L>>,
    EndpointOutputType<L>
  > = fetchQuery((p: any, q: any) => getListFn({ ...p, filter: { ...p.filter, ...q } }));
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
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  C extends MinimalEndpoint,
  E extends MinimalEndpoint,
  D extends MinimalEndpoint,
  CC extends Record<string, MinimalEndpointInstance>
>(
  key: string,
  e: EndpointREST<G, L, C, E, D, CC>,
  override?: ResourceEndpointsQueriesOverride<ES, G, L, CC>
): ResourceQueries<G, L, CC> => {
  return {
    get: toGetResourceQuery(e.get, key, override?.get),
    list: toGetListResourceQuery(e.getList, key, override?.list),
    Custom: pipe(
      e.Custom,
      Rec.mapWithIndex((index, ee) => {
        const getKey = getDefaultKey(`${key}-${index}`);
        const fetch = fetchQuery<any, any, any>((p, q) => {
          return ee({ Params: p, Query: q } as any, q);
        });

        return {
          getKey,
          fetch,
          useQuery: (p: any, q: any, d: any, prefix: any) => {
            const qKey = getKey(p, q, d, prefix);

            return useQuery({
              queryKey: qKey,
              queryFn: ({ queryKey }) => fetch(queryKey[1], queryKey[2], !!queryKey[3]),
            });
          },
        };
      })
    ) as any,
  };
};
