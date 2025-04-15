import { IOError } from '@ts-endpoint/core';
import { TestEndpoints } from '@ts-endpoint/test';
import { Schema } from 'effect';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { assertType, describe, expectTypeOf, test } from 'vitest';
import { EndpointRequest, GetResourceClient, toEndpointRequest } from '../ResourceClient.js';

describe(GetResourceClient.name, () => {
  const resourceClient = GetResourceClient({} as any, TestEndpoints, {
    decode: (s) => (u) =>
      pipe(
        u,
        Schema.encodeUnknownEither(s as Schema.Schema<any>),
        E.mapLeft(
          (e) =>
            new IOError(e.message, {
              kind: 'NetworkError',
              status: '500',
              meta: e,
            })
        )
      ),
  });

  describe(toEndpointRequest.name, () => {
    test('should be defined', () => {
      expectTypeOf(resourceClient.Actor.Get).toEqualTypeOf<
        EndpointRequest<typeof TestEndpoints.Actor.Get>
      >();
    });
  });

  test('Should have proper types', () => {
    expectTypeOf(toEndpointRequest(TestEndpoints.Actor.Get)).toMatchObjectType(
      // @ts-expect-error TODO fix this
      (params, query) => {
        assertType<string>(params);
        assertType(query);

        return () =>
          Promise.resolve(
            E.left(
              new IOError('Not implemented', { kind: 'NetworkError', status: '500', meta: {} })
            )
          );
      }
    );
  });
});
