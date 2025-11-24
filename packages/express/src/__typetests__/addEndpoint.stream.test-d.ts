import { Readable } from 'stream';
import { type Codec, Endpoint, type IOError } from '@ts-endpoint/core';
import { Schema } from 'effect';
import * as express from 'express';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { assertType, describe, expectTypeOf, test } from 'vitest';
import { type HTTPStreamResponse } from '../HTTPResponse.js';
import { buildIOError, GetEndpointSubscriber } from '../index.js';

const streamEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.UUID }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/stream`,
  Output: Schema.Struct({ data: Schema.String }),
  Stream: true,
});

const regularEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.UUID }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/data`,
  Output: Schema.Struct({ data: Schema.String }),
});

const router = express.Router();

const decode =
  <A, I, E = any>(s: Codec<A, I, E>, _parseOptions?: any) =>
  (input: unknown, _transformOptions?: any): E.Either<IOError, any> => {
    return pipe(
      input,
      Schema.decodeUnknownEither(s as any),
      E.mapLeft((e) => buildIOError([e]))
    );
  };

const registerRouter = GetEndpointSubscriber({ buildDecodeError: buildIOError, decode });
const AddEndpoint = registerRouter(router);

describe('Stream endpoint types', () => {
  test('Verify streamEndpoint has Stream: true', () => {
    expectTypeOf(streamEndpoint.Stream).toEqualTypeOf<true>();
  });

  test('Should accept HTTPStreamResponse for streaming endpoint', () => {
    const streamData = Readable.from(['chunk1', 'chunk2', 'chunk3']);

    assertType<void>(
      AddEndpoint(streamEndpoint, ({ params: { id } }) => () => {
        assertType<string>(id);

        const response: HTTPStreamResponse = {
          stream: streamData,
          statusCode: 200,
          headers: { 'Content-Type': 'application/octet-stream' },
        };

        return Promise.resolve(E.right(response));
      })
    );
  });

  test('Should NOT accept regular HTTPResponse for streaming endpoint', () => {
    // @ts-expect-error - Stream endpoint requires HTTPStreamResponse, not HTTPResponse
    AddEndpoint(streamEndpoint, ({ params: { id } }) => () => {
      assertType<string>(id);
      return Promise.resolve(E.right({ body: { data: 'test' }, statusCode: 200 }));
    });
  });

  test('Should NOT accept HTTPStreamResponse for regular endpoint', () => {
    const streamData = Readable.from(['chunk1', 'chunk2']);

    // @ts-expect-error - Regular endpoint requires HTTPResponse, not HTTPStreamResponse
    AddEndpoint(regularEndpoint, ({ params: { id } }) => () => {
      assertType<string>(id);

      const response: HTTPStreamResponse = {
        stream: streamData,
        statusCode: 200,
      };

      return Promise.resolve(E.right(response));
    });
  });

  test('Should accept regular HTTPResponse for regular endpoint', () => {
    assertType<void>(
      AddEndpoint(regularEndpoint, ({ params: { id } }) => () => {
        assertType<string>(id);
        return Promise.resolve(E.right({ body: { data: 'test' }, statusCode: 200 }));
      })
    );
  });

  test('HTTPStreamResponse type should have correct shape', () => {
    const streamData = Readable.from(['test']);

    const response: HTTPStreamResponse = {
      stream: streamData,
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
    };

    expectTypeOf(response.stream).toEqualTypeOf<NodeJS.ReadableStream>();
    expectTypeOf(response.statusCode).toEqualTypeOf<number>();
    expectTypeOf(response.headers).toEqualTypeOf<Record<string, string> | undefined>();
  });
});
