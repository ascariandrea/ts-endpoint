import {
  type Codec,
  type EitherDecoder,
  type IOError,
  type MinimalEndpointInstance,
  type runtimeType,
  type TypeOfEndpointInstance,
} from '@ts-endpoint/core';
import { type Either } from 'fp-ts/lib/Either.js';
import { type ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither.js';
import * as R from 'fp-ts/lib/Record.js';
import { type TaskEither } from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { type Kind, type URIS } from './HKT.js';
import { type HTTPClientConfig } from './config.js';

export declare type RequiredKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  [K in keyof T]: {} extends Pick<T, K> ? never : K;
} extends {
  [_ in keyof T]: infer U;
}
  ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {} extends U
    ? never
    : U
  : never;

type FunctionOutput<F> = F extends (args: any) => infer O ? O : never;

type ExtractEither<TA> = TA extends TaskEither<infer E, infer R> ? Either<E, R> : never;

export type InferFetchResult<FC> = ExtractEither<FunctionOutput<FC>>;

type FetchClientError<E, M extends URIS> =
  E extends Record<number, Codec<any, any, any>> ? Kind<M, E> : Kind<M, never>;

export type FetchClient<E extends MinimalEndpointInstance, M extends URIS> = ReaderTaskEither<
  'Input' extends RequiredKeys<E> ? TypeOfEndpointInstance<E>['Input'] : void,
  E['Errors'] extends undefined ? IOError : FetchClientError<E['Errors'], M>,
  runtimeType<E['Output']>
>;

export type HTTPClient<A extends Record<string, MinimalEndpointInstance>, M extends URIS> = {
  [K in keyof A]: FetchClient<A[K], M>;
};

export type GetHTTPClientOptions = {
  defaultHeaders?: { [key: string]: string };
  /**
   * Used to perform side effect on api Errors,
   * like logging on external services, or to manipulate errors before
   * individually handling them.
   */
  handleError?: (err: IOError<any>, e: MinimalEndpointInstance) => any;
  /**
   * If true a non-JSON response will be treated like
   * a JSON response returning undefined. Defaults to false.
   */
  ignoreNonJSONResponse?: boolean;
  /**
   * Used to map the response JSON before parsing it with the Endpoint codecs.
   * N.B. This is a last resource and you should avoid it since it holds no static guarantee
   */
  mapInput?: (a: any) => any;

  /**
   * Used to map the response JSON before parsing it with the Endpoint codecs.
   * N.B. This is a last resource and you should avoid it since it holds no static guarantee
   */
  decode: EitherDecoder;
};

export const GetHTTPClient = <A extends { [key: string]: MinimalEndpointInstance }, M extends URIS>(
  config: HTTPClientConfig,
  endpoints: A,
  getFetchClient: <E extends MinimalEndpointInstance>(
    baseURL: string,
    endpoint: E,
    options: GetHTTPClientOptions
  ) => FetchClient<E, M>,
  options: GetHTTPClientOptions
): HTTPClient<A, M> => {
  const headersWithWhiteSpaces = pipe(
    options?.defaultHeaders ?? {},
    R.filterWithIndex((k: string) => k.includes(' ')),
    R.keys
  );

  if (headersWithWhiteSpaces.length > 0) {
    // eslint-disable-next-line no-console
    console.error('white spaces are not allowed in defaultHeaders names:', headersWithWhiteSpaces);
  }
  const baseURL = `${config.protocol}://${config.host}${
    config.port !== undefined ? `:${config.port.toString()}` : ''
  }`;

  const clientWithMethods = Object.entries(endpoints).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: getFetchClient(baseURL, v, options),
    }),
    {} as HTTPClient<A, M>
  );

  return clientWithMethods;
};
