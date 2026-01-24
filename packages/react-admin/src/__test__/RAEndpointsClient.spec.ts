import { IOError } from '@ts-endpoint/core';
import { throwTE } from '@ts-endpoint/core/lib/utils.js';
import { throwTE as throwTECore } from '@ts-endpoint/core/lib/utils.js';
import { TestEndpoints, decodeIdentity } from '@ts-endpoint/test';
import { AxiosHeaders } from 'axios';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import type { APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient, dataProviderRequestLift } from '../RAEndpointsClient.js';

describe('RAEndpointsClient (consolidated)', () => {
  it('basic shape and Actor.get (skipped integration-like)', () => {
    const apiRESTClient = mock<APIRESTClient>();
    const apiClient = RAEndpointsClient(apiRESTClient, {
      decode: decodeIdentity,
    })(TestEndpoints);

    expect(apiClient).toBeDefined();
    expect(apiClient.Endpoints.Actor.get).toBeDefined();
    expect(apiClient.Endpoints.Actor.getList).toBeDefined();
    expect(apiClient.Endpoints.Actor.Custom.GetSiblings).toBeDefined();
  });

  it('getList and Custom endpoints return data', async () => {
    const apiRESTClient = mock<APIRESTClient>();
    apiRESTClient.getList.mockResolvedValue({ data: [{ id: '1' }], total: 1 });
    apiRESTClient.request.mockResolvedValue({ data: [{ id: '2' }], total: 1 });

    const client = RAEndpointsClient(apiRESTClient, {
      decode: decodeIdentity,
    })(TestEndpoints);

    const list = await throwTE(
      client.Endpoints.Actor.getList({
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'createdAt', order: 'ASC' },
        filter: { ids: [] },
      })
    );
    expect(list).toEqual({ data: [{ id: '1' }], total: 1 });

    const custom = await throwTE(
      client.Endpoints.Actor.Custom.GetSiblings({
        Params: { id: '1' },
        Body: {},
        Headers: {},
        Query: {},
      })
    );
    expect(custom).toEqual({ data: [{ id: '2' }], total: 1 });
  });

  describe('Custom payloads', () => {
    it('sends only Params when provided', async () => {
      const apiRESTClient = mock<APIRESTClient>();
      const client = RAEndpointsClient(apiRESTClient, { decode: decodeIdentity })(TestEndpoints);

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
      const apiRESTClient = mock<APIRESTClient>();
      const client = RAEndpointsClient(apiRESTClient, { decode: decodeIdentity })(TestEndpoints);

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
      const apiRESTClient = mock<APIRESTClient>();
      const client = RAEndpointsClient(apiRESTClient, { decode: decodeIdentity })(TestEndpoints);

      apiRESTClient.request.mockResolvedValue({ data: { data: [{ id: '3' }], total: 1 } });
      await pipe(
        client.Endpoints.Actor.Custom.GetSiblings({
          Params: { id: '1' },
          Headers: { 'X-Test': 'ok' },
          Body: {},
        }),
        throwTECore
      );

      expect(apiRESTClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Test': 'ok', Accept: 'application/json' }),
        })
      );
    });

    it('sends Body when provided', async () => {
      const apiRESTClient = mock<APIRESTClient>();
      const client = RAEndpointsClient(apiRESTClient, { decode: decodeIdentity })(TestEndpoints);

      apiRESTClient.request.mockResolvedValue({ data: { data: [{ id: '4' }], total: 1 } });
      const resBody = await throwTE(
        client.Endpoints.Actor.Custom.GetSiblings({ Params: { id: '1' }, Body: { foo: 'bar' } })
      );
      expect(resBody).toEqual({ data: { data: [{ id: '4' }], total: 1 } });

      expect(apiRESTClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ data: { foo: 'bar' } })
      );
    });
  });

  it('extra coverage: maps success response through decode and returns data', async () => {
    const apiClient = mock<APIRESTClient>();
    apiClient.get.mockResolvedValue({ data: { id: '1' } });
    apiClient.getList.mockResolvedValue({ data: [{ id: '1' }], total: 1 });
    apiClient.create.mockResolvedValue({ data: { id: '2' } });
    apiClient.put.mockResolvedValue({
      data: { id: '1', ok: true },
      status: 0,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    apiClient.delete.mockResolvedValue({ data: { ok: true, id: '' } });
    apiClient.request.mockResolvedValue({ data: { x: 1 } });

    const clientFactory = RAEndpointsClient(apiClient, { decode: decodeIdentity });
    const client = clientFactory(TestEndpoints);

    const got = await client.Endpoints.Actor.get({} as any, {} as any)();
    expect(got._tag === 'Right' ? got.right : null).toEqual({ id: '1' });

    apiClient.get.mockRejectedValue(new Error('boom'));
    const clientErr = RAEndpointsClient(apiClient, { decode: decodeIdentity })(TestEndpoints);
    const res = await clientErr.Endpoints.Actor.get({} as any, {} as any)();
    expect(res._tag === 'Left' ? res.left.constructor.name : null).toBe('IOError');
  });

  describe('dataProviderRequestLift and error mapping', () => {
    const okDecoder = <A, B extends { data: any }>(a: A): E.Either<unknown, B> =>
      E.right(a as unknown as B);

    it('maps axios-like errors to IOError with response data and statusText', async () => {
      const axiosLike: unknown = {
        isAxiosError: true,
        message: 'not found',
        response: { statusText: '404', data: { foo: 'bar' } },
      };

      const te = dataProviderRequestLift(() => Promise.reject(axiosLike as Error), okDecoder);

      const res = await te();
      expect(E.isLeft(res)).toBeTruthy();
      const left = (res as unknown as { left: IOError }).left;
      expect(left).toBeInstanceOf(IOError);
      expect(left.message).toBe('not found');
      expect(left.details).toMatchObject({ kind: 'ClientError', meta: { foo: 'bar' } });
    });

    it('passes through IOError instances unchanged', async () => {
      const err = new IOError('boom', { kind: 'ClientError', status: '500' });

      const te = dataProviderRequestLift(() => Promise.reject(err), okDecoder);
      const res = await te();
      expect(E.isLeft(res)).toBeTruthy();
      const left = (res as unknown as { left: IOError }).left;
      expect(left).toBe(err);
    });

    it('wraps Error instances into IOError', async () => {
      const te = dataProviderRequestLift(() => Promise.reject(new Error('ohno')), okDecoder);
      const res = await te();
      expect(E.isLeft(res)).toBeTruthy();
      const left = (res as unknown as { left: IOError }).left;
      expect(left.message).toBe('ohno');
    });

    it('wraps unknown rejections into generic IOError', async () => {
      const te = dataProviderRequestLift(() => Promise.reject(123 as unknown as Error), okDecoder);
      const res = await te();
      expect(E.isLeft(res)).toBeTruthy();
      const left = (res as unknown as { left: IOError }).left;
      expect(left.message).toBe('Unknown error');
      expect(left.details).toMatchObject({ meta: 123 });
    });
  });
});
