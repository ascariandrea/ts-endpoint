import {
  IOError,
  type Codec,
  type DecodeCodecFn,
  type EndpointDecodeFn,
  type EndpointInstance,
  type EndpointOutputType,
  type EndpointsMapType,
  type InferEndpointInstanceParams,
  type InferEndpointParams,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
  type ResourceEndpoints,
  type runtimeType,
  type serializedType,
  type TypeOfEndpointInstance,
} from '@ts-endpoint/core';
import { isAxiosError } from 'axios';
import * as A from 'fp-ts/lib/Array.js';
import type * as E from 'fp-ts/lib/Either.js';
import * as R from 'fp-ts/lib/Record.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import type { CreateParams, GetListResult, GetOneResult } from 'react-admin';
import { type APIRESTClient } from './ApiRestClient.js';
import {
  type CustomEndpointFn,
  type CustomEndpointsRecord,
  type EndpointsRESTClient,
  type ResourceEndpointREST,
} from './types.js';

const toError = (e: unknown): IOError => {
  if (isAxiosError(e)) {
    return new IOError(e.message, {
      kind: 'ClientError',
      status: e.response?.statusText ?? '500',
      meta: e.response?.data,
    });
  }

  if (e instanceof IOError) {
    return e;
  }

  if (e instanceof Error) {
    return new IOError(e.message, {
      kind: 'ClientError',
      status: '500',
      meta: e,
    });
  }

  return new IOError('Unknown error', {
    kind: 'ClientError',
    status: '500',
    meta: e,
  });
};

export const dataProviderRequestLift = <B extends { data: any }, E>(
  lp: () => Promise<GetOneResult<any>> | Promise<GetListResult<any>>,
  decode: <A>(a: A) => E.Either<E, B>
): TE.TaskEither<E | IOError, B> => {
  return pipe(TE.tryCatch(lp, toError), TE.chainEitherKW(decode));
};

const restFromResourceEndpoints = <
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  C extends MinimalEndpoint,
  E extends MinimalEndpoint,
  D extends MinimalEndpoint,
  CC extends Record<string, MinimalEndpointInstance>,
>(
  apiClient: APIRESTClient,
  e: ResourceEndpoints<
    EndpointInstance<G>,
    EndpointInstance<L>,
    EndpointInstance<C>,
    EndpointInstance<E>,
    EndpointInstance<D>,
    CC
  >,
  decode: FromEndpointsOptions['decode']
): ResourceEndpointREST<G, L, C, E, D, CC> => {
  const decodeAsCodecDecodeFn = decode as DecodeCodecFn<any>;

  return {
    get: (params, query) => {
      const url = e.Get.getPath(params);
      const getParams = { ...(params ?? {}), ...(query ?? {}) };
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.get<
              serializedType<InferEndpointParams<G>['output']> & {
                id: string;
              }
            >(url, getParams),
          decodeAsCodecDecodeFn(e.Get.Output)
        ),
        TE.map((r) => r.data)
      );
    },
    getList: (params) => {
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.getList<{
              id: string;
            }>(e.List.getPath(params), params),
          decodeAsCodecDecodeFn(e.List.Output satisfies Codec<any, any>)
        )
      );
    },
    post: (params) => {
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.create<
              runtimeType<InferEndpointInstanceParams<C>['output']> & {
                id: string;
              }
            >(e.Create.getPath(params), { data: params } as CreateParams),
          decodeAsCodecDecodeFn(e.Create.Output)
        ),
        TE.map((r) => r.data)
      );
    },
    edit: (params) => {
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.put<runtimeType<InferEndpointInstanceParams<E>['output']>>(
              e.Edit.getPath(params),
              params
            ),
          decodeAsCodecDecodeFn(e.Edit.Output)
        ),
        TE.map((r) => r.data)
      );
    },
    delete: (params) => {
      return pipe(
        dataProviderRequestLift(
          () => apiClient.delete(e.Delete.getPath(params), params),
          decodeAsCodecDecodeFn(e.Delete.Output satisfies Codec<any, any>)
        )
      );
    },
    Custom: pipe(
      e.Custom,
      R.mapWithIndex((_, ee) => {
        const fetch = (
          params: TypeOfEndpointInstance<typeof ee>['Input']
        ): TE.TaskEither<IOError, EndpointOutputType<typeof ee>> => {
          const url = ee.getPath((params as any)?.Params);

          return dataProviderRequestLift(
            () =>
              apiClient.request({
                method: ee.Method,
                url,
                params: params?.Query,
                data: params?.Body,
                responseType: 'json',
                headers: {
                  Accept: 'application/json',
                  ...params?.Headers,
                },
              }),
            decodeAsCodecDecodeFn(ee.Output)
          );
        };

        const customFetch: CustomEndpointFn<typeof ee> = (params, q) => {
          const p: any = params;
          const payload: any = {
            ...(p?.Params ? { Params: p.Params } : {}),
            ...(p?.Query ? { Query: { ...p.Query, ...(q ?? {}) } } : {}),
            ...(p?.Headers ? { Headers: p.Headers } : {}),
            ...(p?.Body ? { Body: p.Body } : {}),
          };
          return pipe(fetch(payload));
        };

        return customFetch;
      })
    ) as CustomEndpointsRecord<CC>,
  };
};

interface FromEndpointsOptions {
  decode: EndpointDecodeFn<IOError>;
}

const RAEndpointsClient =
  (apiClient: APIRESTClient, opts: FromEndpointsOptions) =>
  <ES extends EndpointsMapType>(Endpoints: ES): EndpointsRESTClient<ES> => {
    const endpoints = pipe(
      Endpoints,
      R.toArray,
      A.reduce({}, (q, [k, e]) => ({
        ...q,
        [k]: restFromResourceEndpoints(apiClient, e as any, opts.decode),
      }))
    ) as EndpointsRESTClient<ES>['Endpoints'];

    return {
      Endpoints: endpoints,
      client: apiClient,
    };
  };

export { RAEndpointsClient };
