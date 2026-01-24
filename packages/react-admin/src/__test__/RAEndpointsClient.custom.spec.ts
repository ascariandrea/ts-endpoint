import { throwTE } from '@ts-endpoint/core/lib/utils.js';
import { TestEndpoints } from '@ts-endpoint/test';
import type { Either } from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { describe, it, expect } from 'vitest';
import { mock } from 'vitest-mock-extended';
import type { APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient } from '../RAEndpointsClient.js';

describe('RAEndpointsClient Custom payloads', () => {
  const apiRESTClient = mock<APIRESTClient>();
  const identityDecode =
    () =>
    (i: unknown): Either<any, any> => ({ _tag: 'Right', right: i });
  const client = RAEndpointsClient(apiRESTClient, { decode: identityDecode })(TestEndpoints);

  it('sends only Params when provided', async () => {
    apiRESTClient.request.mockResolvedValue({ data: { data: [{ id: '1' }], total: 1 } });

    const value = await throwTE(
      client.Endpoints.Actor.Custom.GetSiblings({ Params: { id: '1' }, Body: {} })
    );
    expect(value).toEqual({ data: { data: [{ id: '1' }], total: 1 } });

    expect(apiRESTClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        params: undefined,
        data: {},
        headers: expect.objectContaining({ Accept: 'application/json' }),
      })
    );
  });

  it('merges Query with second arg', async () => {
    apiRESTClient.request.mockResolvedValue({ data: { data: [{ id: '2' }], total: 1 } });

    const merged = await throwTE(
      client.Endpoints.Actor.Custom.GetSiblings(
        { Params: { id: '1' }, Query: { a: 1 }, Body: {} },
        { b: 2 }
      )
    );
    expect(merged).toEqual({ data: { data: [{ id: '2' }], total: 1 } });

    expect(apiRESTClient.request).toHaveBeenCalledWith(
      expect.objectContaining({ params: { a: 1, b: 2 } })
    );
  });

  it('includes custom headers when provided', async () => {
    apiRESTClient.request.mockResolvedValue({ data: { data: [{ id: '3' }], total: 1 } });
    await pipe(
      client.Endpoints.Actor.Custom.GetSiblings({
        Params: { id: '1' },
        Headers: { 'X-Test': 'ok' },
        Body: {},
      }),
      throwTE
    );

    expect(apiRESTClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Test': 'ok', Accept: 'application/json' }),
      })
    );
  });

  it('sends Body when provided', async () => {
    apiRESTClient.request.mockResolvedValue({ data: { data: [{ id: '4' }], total: 1 } });
    const resBody = await throwTE(
      client.Endpoints.Actor.Custom.GetSiblings({
        Params: { id: '1' },
        Body: { foo: 'bar' },
      })
    );
    expect(resBody).toEqual({ data: { data: [{ id: '4' }], total: 1 } });

    expect(apiRESTClient.request).toHaveBeenCalledWith(
      expect.objectContaining({ data: { foo: 'bar' } })
    );
  });
});
