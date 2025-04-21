import { Endpoint } from '@ts-endpoint/core';
import { decodeEffect } from '@ts-endpoint/test';
import { Schema } from 'effect';
import { right } from 'fp-ts/lib/Either.js';
import { assertType, describe, expectTypeOf, test } from 'vitest';
import { type HTTPClientConfig } from '../config.js';
import { GetFetchHTTPClient } from '../fetch.js';
import { type InferFetchResult } from '../index.js';

const options: HTTPClientConfig = {
  protocol: 'http',
  host: 'http://test',
  port: 2020,
};

const endpoints = {
  prova: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.String }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
  provaNoParam: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
    },
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
  provaWithoutInput: Endpoint({
    Method: 'GET',
    getPath: () => `users`,
    Output: Schema.Struct({ noInput: Schema.Array(Schema.String) }),
  }),
  provaWithError: Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.String }),
    },
    Errors: {
      401: Schema.Struct({ foo: Schema.String }),
      402: Schema.Struct({ baz: Schema.String }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  }),
};

const fetchClient = GetFetchHTTPClient(options, endpoints, {
  decode: decodeEffect,
  handleError: (err) => err,
});

describe('FetchClient', () => {
  test('should allow to call the endpoint with the correct input', () => {
    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf<string>();

    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf<{ Body: number }>();

    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf({
      Query: 1,
    });

    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf({
      Params: 1,
    });

    expectTypeOf(fetchClient.provaWithoutInput).not.toEqualTypeOf({
      Headers: 1,
    });

    expectTypeOf(fetchClient).not.toEqualTypeOf<{ prova: () => any }>();
    expectTypeOf(fetchClient).not.toEqualTypeOf<{
      prova: (args: { Params: { id: string } }) => any;
    }>();

    expectTypeOf(fetchClient.prova).not.toMatchObjectType<{
      Params: { id: string; foo: string };
      Query: { color: string };
    }>();

    expectTypeOf(fetchClient).not.toMatchObjectType<{
      Params: { id: string };
      Query: { color: string };
      // @dts-jest:fail:snap should not allow to add Body when not declared in the endpoint
      Body: { foo: string };
    }>();

    expectTypeOf(right({})).not.toEqualTypeOf<InferFetchResult<typeof fetchClient.prova>>();

    assertType<InferFetchResult<typeof fetchClient.prova>>(right({ crayons: ['brown'] }));

    // const provaWithError = pipe(
    //   fetchClient.provaWithError({
    //     Params: { id: '123' },
    //     Query: { color: 'marrone' },
    //   }),
    //   TA.mapLeft((err) => {
    //     if (err.details.kind === 'KnownError') {
    //       if (err.details.status === 401) {
    //         err.details.body.foo;

    //         err.details.body.baz;
    //       }
    //     }
    //   })
    // );
  });
});
