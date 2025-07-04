import { type Either } from 'fp-ts/lib/Either.js';
import * as R from 'fp-ts/lib/Record.js';
import { pipe } from 'fp-ts/lib/function.js';
import { type RequiredKeys } from 'typelevel-ts';
import {
  type Codec,
  type EffectCodec,
  type EffectRecordCodec,
  type EncodedType,
  type IOTSCodec,
  type IOTSRecordCodec,
  type RecordCodec,
  type RecordCodecEncoded,
  type RecordCodecSerialized,
  type runtimeType,
  type serializedType,
  type UndefinedsToPartial,
} from './Codec.js';
import { addSlash } from './helpers.js';

export type HTTPMethod = 'OPTIONS' | 'HEAD' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type EndpointErrors<S extends string, B extends Codec<any, any>> = Record<S, B>;

/**
 * Represents an HTTP endpoint of our API
 */
export interface Endpoint<
  M extends HTTPMethod,
  O extends Codec<any, any>,
  H extends RecordCodec<any> | undefined,
  Q extends RecordCodec<any> | undefined,
  B extends Codec<any, any> | undefined,
  P extends RecordCodec<any> | undefined,
  E extends EndpointErrors<never, Codec<any, any>> | undefined,
> {
  /* utils to get the full path given a set of query params */
  getPath: [P] extends [undefined] ? (i?: undefined) => string : (args: runtimeType<P>) => string;
  Method: M;
  Errors?: E;
  Input?: [H, P, Q, B] extends [undefined, undefined, undefined, undefined]
    ? never
    : {
        Headers?: H;
        Params?: P;
        Query?: Q;
        Body?: M extends 'POST' | 'PUT' | 'PATCH' | 'DELETE' ? B : never;
      };
  Output: O;
}

export type MinimalEndpoint = Omit<
  Endpoint<
    HTTPMethod,
    Codec<any, any>,
    RecordCodec<any>,
    RecordCodec<any>,
    Codec<any, any>,
    RecordCodec<any>,
    EndpointErrors<never, Codec<any, any>>
  >,
  'getPath'
> & { getPath: (i?: any) => string };

export type InferEndpointParams<E> =
  E extends Endpoint<infer M, infer O, infer H, infer Q, infer B, infer P, infer E>
    ? {
        method: M;
        headers: H;
        params: P;
        query: Q;
        body: B;
        output: O;
        errors: E;
      }
    : never;

/**
 * Data type representing an endpoint instance.
 **/
export type EndpointInstance<E extends MinimalEndpoint> = {
  /**
   * helper to get a path given a set of runtime params.
   *
   * @returns a string representation of a path instance
   * @example
   * ```
   * import { Endpoint } from '..';
   * import * as t from 'io-ts';
   *
   * const endpoint = Endpoint({
   *  Input: {
   *    Params: { id: t.number },
   *  },
   *  Method: 'GET',
   *  getPath: ({ id }) => `users/${id}/crayons`,
   *  Output: { crayons: t.array(t.string) },
   *});
   *
   * endpoint.getPath({ id: 3 })
   * // returns "users/3/crayons"
   * ```
   */
  getPath: E['getPath'];
  /**
   * helper to get a path version with static values in place of actual params.
   *
   * @returns a static representation of the path
   * @example
   * ```
   * import { Endpoint } from '..';
   * import * as t from 'io-ts';
   *
   * const endpoint = Endpoint({
   *  Input: {
   *    Params: { id: t.string },
   *  },
   *  Method: 'GET',
   *  getPath: ({ id }) => `users/${id}/crayons`,
   *  Output: { crayons: t.array(t.string) },
   *});
   *
   * endpoint.getStaticPath(param => `:${param}`) // returns "users/:id/crayons"
   * ```
   */
  getStaticPath: [E['Input']] extends [undefined]
    ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      (i?: {}) => string
    : [InferEndpointParams<E>['params']] extends [undefined]
      ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        (i?: {}) => string
      : (f: (paramName: keyof runtimeType<InferEndpointParams<E>['params']>) => string) => string;
  Method: E['Method'];
  Output: E['Output'];
} & (E['Input'] extends undefined
  ? {
      Input?: never;
    }
  : {
      Input: (InferEndpointParams<E>['params'] extends undefined
        ? { Params?: never }
        : { Params: NonNullable<InferEndpointParams<E>['params']> }) &
        (InferEndpointParams<E>['headers'] extends undefined
          ? { Headers?: never }
          : { Headers: NonNullable<InferEndpointParams<E>['headers']> }) &
        (InferEndpointParams<E>['query'] extends undefined
          ? { Query?: never }
          : { Query: NonNullable<InferEndpointParams<E>['query']> }) &
        (InferEndpointParams<E>['body'] extends undefined
          ? { Body?: never }
          : { Body: NonNullable<InferEndpointParams<E>['body']> });
    }) &
  (E['Errors'] extends undefined ? { Errors?: never } : { Errors: NonNullable<E['Errors']> });

/**
 * Constructor function for an endpoint
 * @returns an EndpointInstance
 */
export function Endpoint<
  M extends HTTPMethod,
  O extends Codec<any, any>,
  Q extends RecordCodec<any> | undefined = undefined,
  H extends RecordCodec<any> | undefined = undefined,
  B extends Codec<any, any> | undefined = undefined,
  P extends RecordCodec<any> | undefined = undefined,
  E extends EndpointErrors<never, Codec<any, any>> | undefined = undefined,
>(e: Endpoint<M, O, H, Q, B, P, E>): EndpointInstance<Endpoint<M, O, H, Q, B, P, E>> {
  // TODO: check if the headers are valid?
  // const headersWithWhiteSpaces = pipe(
  //   e.Input?.Headers?.props ?? {},
  //   R.filterWithIndex((k: string) => k.indexOf(' ') !== -1),
  //   R.keys
  // );

  // if (headersWithWhiteSpaces.length > 0) {
  //   console.error('white spaces are not allowed in Headers names:', headersWithWhiteSpaces);
  // }

  return {
    ...e,
    getPath: ((i: any) => {
      const path = e.getPath(i);

      return addSlash(path);
    }) as typeof e.getPath,
    getStaticPath: (f: (paramName: any) => string) => {
      const params = e.Input?.Params;

      if (params === undefined) {
        return addSlash(e.getPath(undefined as any));
      }

      const fields = (params as any).fields ?? (params as any).props;
      return pipe(
        fields,
        R.mapWithIndex((k) => (f ? f(k) : k)),
        (v: any) => e.getPath(v),
        addSlash
      );
    },
    Output: e.Output,
    ...(e.Errors ? { Errors: e.Errors } : {}),
    Input: {
      ...(e.Input?.Body ? { Body: e.Input.Body } : {}),
      ...(e.Input?.Headers ? { Headers: e.Input.Headers } : {}),
      ...(e.Input?.Params ? { Params: e.Input.Params } : {}),
      ...(e.Input?.Query ? { Query: e.Input.Query } : {}),
    },
  } as unknown as EndpointInstance<Endpoint<M, O, H, Q, B, P, E>>;
}

export type MinimalEndpointInstance = MinimalEndpoint & {
  getStaticPath: (f: (i?: any) => string) => string;
};

export type TypeOfEndpointInstanceInput<E extends MinimalEndpointInstance> = [
  RequiredKeys<E['Input']>,
] extends [never]
  ? void
  : {
      [K in keyof NonNullable<E['Input']>]: NonNullable<E['Input']>[K] extends Codec<any, any>
        ? UndefinedsToPartial<serializedType<NonNullable<E['Input']>[K]>>
        : never;
    };

export type TypeOfEndpointInstance<E extends MinimalEndpointInstance> = {
  getPath: E['getPath'];
  getStaticPath: E['getStaticPath'];
  Method: E['Method'];
  Input: TypeOfEndpointInstanceInput<E>;
  Output: serializedType<E['Output']>;
  Errors: {
    [K in keyof NonNullable<E['Errors']>]: NonNullable<E['Errors']>[K] extends RecordCodec<any>
      ? RecordCodecSerialized<NonNullable<E['Errors']>[K]>
      : NonNullable<E['Errors']>[K] extends Codec<any, any>
        ? serializedType<NonNullable<E['Errors']>[K]>
        : never;
  };
};

export type EndpointInstanceEncodedInputs<E extends MinimalEndpointInstance> = [
  RequiredKeys<E['Input']>,
] extends [never]
  ? void
  : {
      [K in keyof NonNullable<E['Input']>]: NonNullable<E['Input']>[K] extends Codec<any, any, any>
        ? runtimeType<NonNullable<E['Input']>[K]>
        : never;
    };

export type EndpointInstanceEncodedParams<E extends MinimalEndpointInstance> = {
  getPath: E['getPath'];
  getStaticPath: E['getStaticPath'];
  Method: E['Method'];
  Input: EndpointInstanceEncodedInputs<E>;
  Output: runtimeType<E['Output']>;
  Errors: {
    [k in keyof NonNullable<E['Errors']>]: NonNullable<E['Errors']>[k] extends RecordCodec<any>
      ? RecordCodecEncoded<NonNullable<E['Errors']>[k]>
      : never;
  };
};

export type InferEndpointInstanceParams<EI> =
  EI extends EndpointInstance<infer E> ? InferEndpointParams<E> : never;

export type EndpointOutputType<L> = runtimeType<InferEndpointInstanceParams<L>['output']>;

export type EndpointQueryType<G> = InferEndpointInstanceParams<G>['query'] extends undefined
  ? undefined
  : G extends MinimalEndpointInstance
    ? serializedType<InferEndpointInstanceParams<G>['query']>
    : serializedType<InferEndpointParams<G>['query']>;

export type EndpointParamsType<G> = G extends MinimalEndpointInstance
  ? InferEndpointInstanceParams<G>['params'] extends undefined
    ? undefined
    : serializedType<InferEndpointInstanceParams<G>['params']>
  : never;

export type EndpointQueryEncoded<L> = L extends MinimalEndpointInstance
  ? runtimeType<InferEndpointInstanceParams<L>['query']>
  : runtimeType<InferEndpointParams<L>['query']>;

type DecodeUnknown<C, E> = (e: unknown, overrideOptions?: any) => Either<E, EncodedType<C>>;

export type DecodeEffectCodec<E> = <C extends EffectCodec<any, any>>(
  c: C,
  parseOptions?: any
) => DecodeUnknown<C, E>;

export type DecodeIOTSCodec<E> = <C extends IOTSCodec<any, any>>(
  c: C,
  parseOptions?: any
) => DecodeUnknown<C, E>;

export type DecodeIOTSRecordCodec<E> = <C extends IOTSRecordCodec<any>>(
  c: C,
  parseOptions?: any
) => DecodeUnknown<C, E>;

export type DecodeEffectRecordCodecFn<E> = <C extends EffectRecordCodec<any>>(
  c: C,
  parseOptions?: any
) => DecodeUnknown<C, E>;

export type DecodeRecordCodecFn<E> = <C extends RecordCodec<any>>(
  c: C,
  parseOptions?: any
) => DecodeUnknown<C, E>;

export type DecodeCodecFn<E> = <C extends Codec<any, any>>(
  c: C,
  parseOptions?: any
) => DecodeUnknown<C, E>;

export type EndpointDecodeFn<E> =
  | DecodeIOTSRecordCodec<E>
  | DecodeEffectRecordCodecFn<E>
  | DecodeIOTSCodec<E>
  | DecodeEffectCodec<E>
  | DecodeRecordCodecFn<E>
  | DecodeCodecFn<E>;
