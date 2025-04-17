import { IOError } from '@ts-endpoint/core';
import { TestEndpoints } from '@ts-endpoint/test';
import { Schema } from 'effect';
import { mapLeft } from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { type APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient } from '../RAEndpointsClient.js';

describe('EndpointsRESTClient', () => {
  const apiRESTClient = mock<APIRESTClient>();
  const apiClient = RAEndpointsClient(apiRESTClient, {
    decode: (s) => (u) =>
      pipe(
        u,
        Schema.decodeUnknownEither(s as Schema.Schema<any>),
        mapLeft(
          (_) =>
            new IOError('Validation error', {
              kind: 'DecodingError',
              errors: [],
            })
        )
      ),
  })(TestEndpoints);

  it('should be defined', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.Endpoints.Actor.get).toBeDefined();
    expect(apiClient.Endpoints.Actor.getList).toBeDefined();
    expect(apiClient.Endpoints.Actor.Custom.GetSiblings).toBeDefined();
  });
});
