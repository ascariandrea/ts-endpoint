import {
  IOError,
  type DecodeCodecFn,
  type EitherDecode,
  type EndpointDecodeFn,
  type EndpointInstance,
  type EndpointsMapType,
  type MinimalEndpointInstance,
  type ResourceEndpoints,
  type runtimeType,
  type serializedType,
  type TypeOfEndpointInstanceInput,
} from '@ts-endpoint/core';
import { type GetHTTPClientOptions } from '@ts-endpoint/http-client';
import type { AxiosInstance, AxiosResponse } from 'axios';
import * as A from 'fp-ts/lib/Array.js';
import * as R from 'fp-ts/lib/Record.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';

export type EndpointRequest<E extends MinimalEndpointInstance> = (
  input: TypeOfEndpointInstanceInput<E>
) => TE.TaskEither<IOError, runtimeType<E['Output']>>;

export type EndpointREST<
  Get extends MinimalEndpointInstance,
  List extends MinimalEndpointInstance,
  Create extends MinimalEndpointInstance,
  Edit extends MinimalEndpointInstance,
  Delete extends MinimalEndpointInstance,
  Custom extends Record<string, MinimalEndpointInstance> | undefined,
> = {
  Get: EndpointRequest<Get>;
  List: EndpointRequest<List>;
  Create: EndpointRequest<Create>;
  Edit: EndpointRequest<Edit>;
  Delete: EndpointRequest<Delete>;
  Custom: Custom extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof Custom]: Custom[K] extends EndpointInstance<infer E>
          ? EndpointRequest<EndpointInstance<E>>
          : never;
      }
    : undefined;
};

export type API<Endpoints extends EndpointsMapType> = {
  [K in keyof Endpoints]: Endpoints[K] extends ResourceEndpoints<
    infer Get,
    infer List,
    infer Create,
    infer Edit,
    infer Delete,
    infer CC
  >
    ? EndpointREST<Get, List, Create, Edit, Delete, CC>
    : never;
};

export const liftFetch = <A, B>(
  lp: () => Promise<AxiosResponse<A>>,
  decode: EitherDecode<B, IOError>
): TE.TaskEither<IOError, B> => {
  return pipe(
    TE.tryCatch(
      lp,
      (e) => new IOError('Error lifting fetch', { kind: 'NetworkError', status: '500', meta: e })
    ),
    TE.map((d) => d.data),
    TE.chainEitherKW(decode)
  );
};

export const toEndpointRequest =
  <E extends MinimalEndpointInstance>(e: E) =>
  (client: AxiosInstance, decode: EndpointDecodeFn<IOError>): EndpointRequest<E> => {
    return (b: TypeOfEndpointInstanceInput<E>) => {
      const url = e.getPath(b?.Params);

      const decodeAsCodecDecodeFn = decode as DecodeCodecFn<any>;

      return pipe(
        liftFetch<serializedType<E['Output']>, runtimeType<E['Output']>>(() => {
          return client.request<
            TypeOfEndpointInstanceInput<E>,
            AxiosResponse<serializedType<E['Output']>>
          >({
            method: e.Method,
            url,
            params: b?.Query,
            data: b?.Body,
            responseType: 'json',
            headers: {
              Accept: 'application/json',
            },
          });
        }, decodeAsCodecDecodeFn(e.Output))
      );
    };
  };

const GetResourceClient = <ES extends EndpointsMapType>(
  client: AxiosInstance,
  endpoints: ES,
  opts: GetHTTPClientOptions
): API<ES> => {
  const apiImpl = pipe(
    R.toArray(endpoints),
    A.reduce<[keyof ES, any], API<ES>>(
      {} as API<ES>,
      (q, [k, { Custom, ...e }]) =>
        ({
          ...q,
          [k]: pipe(
            e,
            R.map((ee: MinimalEndpointInstance) => toEndpointRequest(ee)(client, opts.decode)),
            (ends) => ({
              ...ends,
              Custom: pipe(
                Custom ?? {},
                R.map((ee: MinimalEndpointInstance) => toEndpointRequest(ee)(client, opts.decode))
              ),
            })
          ),
        }) as API<ES>
    )
  );

  return apiImpl;
};

export { GetResourceClient };
