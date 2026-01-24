import { throwTE } from '@ts-endpoint/core/lib/utils.js';
import { TestEndpoints } from '@ts-endpoint/test';
import { type Either } from 'fp-ts/lib/Either.js';
import { describe, it, expect } from 'vitest';
import { mock } from 'vitest-mock-extended';
import type { APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient } from '../RAEndpointsClient.js';

describe('EndpointsRESTClient', () => {
  const apiRESTClient = mock<APIRESTClient>();
  const identityDecode =
    () =>
    (i: unknown): Either<any, any> => ({ _tag: 'Right', right: i });
  const apiClient = RAEndpointsClient(apiRESTClient, {
    decode: identityDecode,
  })(TestEndpoints);

  it('should be defined', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.Endpoints.Actor.get).toBeDefined();
    expect(apiClient.Endpoints.Actor.getList).toBeDefined();
    expect(apiClient.Endpoints.Actor.Custom.GetSiblings).toBeDefined();
  });

  it('calls Actor.get and returns decoded data', async () => {
    apiRESTClient.get.mockResolvedValue({ data: { data: { id: 'actor-1' } } } as any);

    const te = apiClient.Endpoints.Actor.get({ id: 'actor-1' }, undefined);
    const value = await throwTE(te);
    expect(value).toEqual({ data: { id: 'actor-1' } });
  });
});
