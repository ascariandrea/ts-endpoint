import {
  type Codec,
  type DecodeCodecFn,
  type DecodeRecordCodecFn,
  type EndpointDecodeFn,
  type InferEndpointInstanceParams,
  IOError,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
  type runtimeType,
  type UndefinedOrRuntime,
} from '@ts-endpoint/core';
import { type StreamOutputCodec } from '@ts-endpoint/core';
import { type ParseError } from 'effect/ParseResult';
import type * as express from 'express';
import { sequenceS } from 'fp-ts/lib/Apply.js';
import * as E from 'fp-ts/lib/Either.js';
import * as TA from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { type Controller } from './Controller.js';
import { type Kind, type URIS } from './HKT.js';
import { type HTTPResponse, type HTTPStreamResponse } from './HTTPResponse.js';

const getRouterMatcher = <E extends MinimalEndpoint>(
  router: express.Router,
  e: E
): express.IRouterMatcher<express.Router> => {
  switch (e.Method) {
    case 'POST':
      return router.post;
    case 'PATCH':
      return router.patch;
    case 'PUT':
      return router.put;
    case 'DELETE':
      return router.delete;
    case 'GET':
    default:
      return router.get;
  }
};

export type ErrorMeta<E> = {
  message: string;
  errors?: E;
};

declare module './HKT.js' {
  interface URItoKind<A> {
    IOError: [A] extends [Record<string, Codec<any, any>>] ? IOError<A> : IOError<never>;
  }
}

type EndpointController<E extends MinimalEndpointInstance, M extends URIS = 'IOError'> =
  // If the endpoint output is a StreamOutputCodec, the controller must return an HTTPStreamResponse
  E['Output'] extends StreamOutputCodec<any, any>
    ? Controller<
        Kind<M, NonNullable<E['Errors']>>,
        UndefinedOrRuntime<InferEndpointInstanceParams<E>['params']>,
        UndefinedOrRuntime<InferEndpointInstanceParams<E>['headers']>,
        UndefinedOrRuntime<InferEndpointInstanceParams<E>['query']>,
        UndefinedOrRuntime<InferEndpointInstanceParams<E>['body']>,
        runtimeType<InferEndpointInstanceParams<E>['output']>,
        true
      >
    : Controller<
        Kind<M, NonNullable<E['Errors']>>,
        UndefinedOrRuntime<InferEndpointInstanceParams<E>['params']>,
        UndefinedOrRuntime<InferEndpointInstanceParams<E>['headers']>,
        UndefinedOrRuntime<InferEndpointInstanceParams<E>['query']>,
        UndefinedOrRuntime<InferEndpointInstanceParams<E>['body']>,
        runtimeType<InferEndpointInstanceParams<E>['output']>,
        false | undefined
      >;

export type AddEndpoint<M extends URIS = 'IOError'> = (
  router: express.Router,
  ...m: express.RequestHandler[]
) => <E extends MinimalEndpointInstance>(endpoint: E, controller: EndpointController<E, M>) => void;

export type AddEndpoint2<M extends URIS = 'IOError'> = (
  router: express.Router,
  ...m: express.RequestHandler[]
) => <E extends MinimalEndpointInstance>(
  endpoint: E
) => (controller: EndpointController<E, M>) => void;

export const buildIOError = (errors: unknown) => {
  const parseError = errors as ParseError;
  return new IOError('error decoding args', {
    kind: 'DecodingError',
    errors: [parseError.message],
  });
};

interface GetEndpointSubscriberOptions<M extends URIS = 'IOError'> {
  decode: EndpointDecodeFn<Kind<M, unknown>>;
  buildDecodeError: (e: unknown) => Kind<M, unknown>;
}

const DEFAULT_STREAM_HEADERS_MAP = new Map([
  ['Content-Type', 'text/event-stream'],
  ['Cache-Control', 'no-cache'],
  ['Connection', 'keep-alive'],
  ['X-Accel-Buffering', 'no'], // Disable nginx buffering
]);

/**
 * Adds an endpoint to your router.
 */
export const GetEndpointSubscriber =
  <M extends URIS = 'IOError'>({
    buildDecodeError,
    decode,
  }: GetEndpointSubscriberOptions<M>): AddEndpoint<M> =>
  (router, ...m) =>
  <E extends MinimalEndpointInstance>(e: E, controller: EndpointController<E, M>): void => {
    const matcher = getRouterMatcher(router, e);
    const path = e.getStaticPath((param: string) => `:${param}`);

    const decodeAsDecodeRecord = decode as DecodeRecordCodecFn<Kind<M, unknown>>;
    const decodeAsDecodeCodec = decode as DecodeCodecFn<Kind<M, unknown>>;

    matcher.bind(router)(path, ...(m ?? []), (req, res, next) => {
      const args = sequenceS(E.Applicative)({
        params: !e.Input?.Params
          ? E.right(undefined)
          : decodeAsDecodeRecord(e.Input.Params)(req.params),
        headers: !e.Input?.Headers
          ? E.right(undefined)
          : decodeAsDecodeRecord(e.Input.Headers)(req.headers),
        query: !e.Input?.Query
          ? E.right(undefined)
          : decodeAsDecodeRecord(e.Input.Query)(req.query),
        body: !e.Input?.Body ? E.right(undefined) : decodeAsDecodeCodec(e.Input.Body)(req.body),
      });

      const taskRunner = pipe(
        args,
        E.mapLeft((error) => buildDecodeError(error) as Kind<M, NonNullable<E['Errors']>>),
        TA.fromEither,
        // controller return type can be a conditional (stream vs regular). Cast to any
        // here to avoid complicated type union propagation through fp-ts helpers.
        TA.chain((args) => controller(args as any, req, res) as any),
        TA.bimap(
          (e) => {
            return next(e);
          },
          (httpResponse: any) => {
            // Set default stream headers first so user headers can override them
            if ('stream' in httpResponse) {
              const streamResponse = httpResponse as HTTPStreamResponse;
              res.status(streamResponse.statusCode);
              for (const [key, value] of DEFAULT_STREAM_HEADERS_MAP) {
                res.set(key, value);
              }
              if (streamResponse.headers !== undefined) {
                res.set(streamResponse.headers);
              }
              streamResponse.stream.pipe(res);
              streamResponse.stream.on('error', (err) => {
                if (!res.headersSent) {
                  res.status(500).send(String(err));
                }
              });
            } else {
              const regularResponse = httpResponse as HTTPResponse<any>;
              if (regularResponse.headers !== undefined) {
                res.set(regularResponse.headers);
              }
              res.status(regularResponse.statusCode).send(regularResponse.body);
            }
          }
        )
      );

      void taskRunner();
    });
  };
