import * as A from 'fp-ts/lib/Array.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as Rec from 'fp-ts/lib/Record.js';
import { EndpointsMapType } from 'ts-endpoint';
import { API } from "../api/api.provider.js";
import { toQueries } from "./QueryProvider.js";
import {
  toOverrideQueries,
  type CustomQueryOverride,
  type QueryProviderOverrides,
  type ResourceEndpointsQueriesOverride,
} from "./QueryProviderOverrides.js";
import {
  type GetQueryProviderImplAt,
  type QueryProvider,
  type ResourceQuery,
} from "./types.js";

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
          [KK in keyof CC]: CC[KK] extends CustomQueryOverride<
            ES,
            infer P,
            infer Q,
            infer O
          >
            ? ResourceQuery<P, Q, O>
            : GetQueryProviderImplAt<ES, K, KK>;
        };
      }
    : GetQueryProviderImplAt<ES, K>;
};

interface EndpointsQueryProviderV2<
  ES extends EndpointsMapType,
  O extends Record<string, any>,
> {
  Queries: PatchedQueryProvider<ES, O>;
  REST: EndpointsRESTClient<ES>;
  API: API;
}

const CreateQueryProvider = <
  ES extends EndpointsMapType,
  O extends Record<string, any>,
>(
  endpointsRESTClient: EndpointsRESTClient<ES>,
  overrides?: QueryProviderOverrides<ES, O>,
): EndpointsQueryProviderV2<ES, O> => {
  const queryProvider = pipe(
    endpointsRESTClient.Endpoints,
    Rec.toArray,
    A.reduce({}, (q, [k, e]) => {
      const override = overrides?.[k] ?? undefined;
      return {
        ...q,
        [k]: toQueries(k, e, override),
      };
    }),
  ) as QueryProvider<ES>;

  let queryProviderOverrides: any = {};
  if (overrides) {
    queryProviderOverrides = pipe(
      overrides,
      Rec.toArray,
      A.reduce({}, (q, [k, e]) => {
        return {
          ...q,
          [k]: toOverrideQueries(endpointsRESTClient.Endpoints, k, e),
        };
      }),
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
    }),
  ) as PatchedQueryProvider<ES, O>;

  return {
    Queries: patchedQueryProvider,
    REST: endpointsRESTClient,
    API: API(endpointsRESTClient.client.client),
  };
};


export { CreateQueryProvider, type QueryProvider };
