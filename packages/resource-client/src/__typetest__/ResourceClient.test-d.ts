import { IOError } from '@ts-endpoint/core';
import { decodeEffect, TestEndpoints } from '@ts-endpoint/test';
import * as E from 'fp-ts/lib/Either.js';
import { assertType, describe, expectTypeOf, test } from 'vitest';
import { type EndpointRequest, GetResourceClient, toEndpointRequest } from '../ResourceClient.js';

describe(GetResourceClient.name, () => {
  const resourceClient = GetResourceClient({} as any, TestEndpoints, {
    decode: decodeEffect,
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
