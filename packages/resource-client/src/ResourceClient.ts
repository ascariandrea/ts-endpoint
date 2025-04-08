import { AxiosRequestConfig, type AxiosInstance, type AxiosResponse } from 'axios';
import * as A from 'fp-ts/lib/Array.js';
import * as R from 'fp-ts/lib/Record.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import {
  type EndpointInstance,
  type MinimalEndpointInstance,
  type ResourceEndpoints,
  type TypeOfEndpointInstanceInput,
} from 'ts-endpoint';
import { GetHTTPClientOptions } from 'ts-endpoint-browser/lib/index.js';
import {
  EitherDecode,
  EitherDecoder,
  IOError,
  type runtimeType,
  type serializedType,
} from 'ts-io-error';

export type TERequest<E extends MinimalEndpointInstance> = (
  input: TypeOfEndpointInstanceInput<E>
) => TE.TaskEither<IOError, runtimeType<E['Output']>>;

export type API<Endpoints extends Record<string, any>> = {
  [K in keyof Endpoints]: Endpoints[K] extends ResourceEndpoints<
    infer Get,
    infer List,
    any,
    any,
    any,
    infer CC
  >
    ? {
        Get: TERequest<Get>;
        List: TERequest<List>;
        Custom: CC extends Record<string, MinimalEndpointInstance>
          ? {
              [K in keyof CC]: CC[K] extends EndpointInstance<infer E>
                ? TERequest<EndpointInstance<E>>
                : never;
            }
          : object;
      }
    : never;
} & {
  get: <T>(url: string, config?: AxiosRequestConfig) => TE.TaskEither<IOError, T>;
  post: <T, R>(url: string, data?: T, config?: AxiosRequestConfig<T>) => TE.TaskEither<IOError, R>;
  put: <T, R>(url: string, data?: T, config?: AxiosRequestConfig<T>) => TE.TaskEither<IOError, R>;
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

export const toTERequest =
  <E extends MinimalEndpointInstance>(e: E) =>
  (client: AxiosInstance, decode: EitherDecoder): TERequest<E> => {
    return (b: TypeOfEndpointInstanceInput<E>) => {
      const url = e.getPath(b?.Params);
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
        }, decode(e.Output))
      );
    };
  };

const GetResourceClient = <
  ES extends Record<
    string,
    ResourceEndpoints<
      MinimalEndpointInstance,
      MinimalEndpointInstance,
      MinimalEndpointInstance,
      MinimalEndpointInstance,
      MinimalEndpointInstance,
      Record<string, MinimalEndpointInstance>
    >
  >
>(
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
            R.map((ee: MinimalEndpointInstance) => toTERequest(ee)(client, opts.decode)),
            (ends) => ({
              ...ends,
              Custom: pipe(
                Custom,
                R.map((ee: MinimalEndpointInstance) => toTERequest(ee)(client, opts.decode))
              ),
            })
          ),
        } as API<ES>)
    )
  );

  return apiImpl;
};

export { GetResourceClient };
