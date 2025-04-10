import { TestEndpoints } from '@ts-endpoint/test/lib/index.js';
import * as E from 'fp-ts/lib/Either.js';
import { IOError } from 'ts-io-error';
import { assertType, describe, expectTypeOf, it } from 'vitest';
import { toTERequest } from '../ResourceClient.js';

describe('ApiProvider', () => {
  it('Should have proper types', () => {
    expectTypeOf(toTERequest(TestEndpoints.Actor.Get)).toMatchObjectType(
      // @ts-expect-error TODO fix this
      (params, query) => {
        assertType<string>(params);
        assertType(query);

        return () =>
          Promise.resolve(
            E.left(new IOError('Not implemented', { kind: 'NetworkError', status: "500", meta: {} }))
          );
      }
    );
  });
});
