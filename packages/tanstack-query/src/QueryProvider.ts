import { type EndpointsMapType } from '@ts-endpoint/core';
import { type API } from '@ts-endpoint/resource-client';
import * as A from 'fp-ts/lib/Array.js';
import * as Rec from 'fp-ts/lib/Record.js';
import { pipe } from 'fp-ts/lib/function.js';
import { toQueries } from './GetQueries.js';
import {
  toOverrideQueries,
  type CustomQueryOverride,
  type QueryProviderOverrides,
  type ResourceEndpointsQueriesOverride,
} from './QueryProviderOverrides.js';
import { type GetQueryProviderImplAt, type QueryProvider, type ResourceQuery } from './types.js';

type PatchedQueryProvider<
  ES extends EndpointsMapType,
  O extends Record<string, any>,
> = QueryProvider<ES> & {
  [K in keyof QueryProviderOverrides<ES, O>]: QueryProviderOverrides<
    ES,
    O
  >[K] extends ResourceEndpointsQueriesOverride<ES, any, any, infer CC>
    ? {
        Custom: {
          [KK in keyof CC]: CC[KK] extends CustomQueryOverride<ES, infer P, infer Q, infer O>
            ? ResourceQuery<P, Q, O>
            : GetQueryProviderImplAt<ES, K, KK>;
        };
      }
    : GetQueryProviderImplAt<ES, K>;
};

export type EndpointsQueryProvider<
  ES extends EndpointsMapType,
  O extends Record<string, any>,
> = PatchedQueryProvider<ES, O>;

const CreateQueryProvider = <ES extends EndpointsMapType, O extends Record<string, any>>(
  resourceClient: API<ES>,
  overrides?: QueryProviderOverrides<ES, O>
): EndpointsQueryProvider<ES, O> => {
  const queryProvider = pipe(
    resourceClient,
    Rec.toArray,
    A.reduce({}, (q, [k, e]) => {
      const override = overrides?.[k] ?? undefined;
      return {
        ...q,
        [k]: toQueries(k, e, override),
      };
    })
  ) as QueryProvider<ES>;

  let queryProviderOverrides: any = {};
  if (overrides) {
    queryProviderOverrides = pipe(
      overrides,
      Rec.toArray,
      A.reduce({}, (q, [k, e]) => {
        return {
          ...q,
          [k]: toOverrideQueries(resourceClient, k, e),
        };
      })
    );
  }

  const patchedQueryProvider = pipe(
    queryProvider,
    Rec.toArray,
    A.reduce({}, (q, [k, e]) => {
      const def = queryProviderOverrides[k];
      if (def) {
        const { Custom, ...rest } = queryProviderOverrides[k];
        return {
          ...q,
          [k]: {
            get: rest.get ?? e.get,
            list: rest.list ?? e.list,
            Custom: {
              ...e.Custom,
              ...Custom,
            },
          },
        };
      }
      return { ...q, [k]: e };
    })
  ) as PatchedQueryProvider<ES, O>;

  return patchedQueryProvider;
};

export { CreateQueryProvider, type QueryProvider };
