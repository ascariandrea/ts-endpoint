import { IOError } from '@ts-endpoint/core';
import { throwTE } from '@ts-endpoint/core/lib/utils.js';
import { TestEndpoints, decodeIdentity } from '@ts-endpoint/test';
import { type AxiosInstance } from 'axios';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { GetResourceClient } from '../ResourceClient.js';

describe('GetResourceClient (consolidated)', () => {
  it('basic shape and Get resolved', async () => {
    const axiosMock = mock<AxiosInstance>();

    const api = GetResourceClient(axiosMock, TestEndpoints, {
      decode: decodeIdentity,
    });

    expect(api.Actor.Get).toBeDefined();
    expect(api.Actor.Create).toBeDefined();
    expect(api.Actor.Edit).toBeDefined();
    expect(api.Actor.List).toBeDefined();

    axiosMock.request.mockResolvedValue({ data: { data: { id: '1' } } } as unknown);

    const res = await pipe(api.Actor.Get({ Params: { id: '1' } }), throwTE);
    expect(res).toEqual({ data: { id: '1' } });
  });

  it('CRUD operations behave as expected', async () => {
    const axiosMock = mock<AxiosInstance>();

    const api = GetResourceClient(axiosMock, TestEndpoints, {
      decode: decodeIdentity,
    });

    const actor3 = {
      id: '3',
      name: 'actor 3',
      avatar: {
        id: 'a3',
        url: 'u3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      bornOn: null,
      diedOn: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    axiosMock.request.mockResolvedValue({ data: { data: actor3 } });
    const created = await throwTE(api.Actor.Create({ Body: actor3 }));
    expect(created).toEqual({ data: actor3 });

    const edited = { ...actor3, id: '1', name: 'edited' };
    axiosMock.request.mockResolvedValue({ data: { data: edited } });
    const editRes = await throwTE(api.Actor.Edit({ Params: { id: '1' }, Body: edited }));
    expect(editRes).toEqual({ data: edited });

    axiosMock.request.mockResolvedValue({ data: true });
    const del = await throwTE(api.Actor.Delete({ Params: { id: '1' } }));
    expect(del).toBe(true);

    const actor1 = { ...edited, id: '1' };
    axiosMock.request.mockResolvedValue({ data: { data: [actor1], total: 1 } });
    const list = await throwTE(api.Actor.List({ Query: { _start: '0', _end: '10', ids: [] } }));
    expect(list).toEqual({ data: [actor1], total: 1 });

    axiosMock.request.mockRejectedValue(new Error('network'));
    await expect(throwTE(api.Actor.Get({ Params: { id: '1' } }))).rejects.toBeInstanceOf(Error);
  });

  it('request shape, decode errors and headers merging', async () => {
    const axiosMock = mock<AxiosInstance>();

    const api = GetResourceClient(axiosMock, TestEndpoints, {
      decode: decodeIdentity,
    });

    axiosMock.request.mockResolvedValue({ data: { data: { id: '1' } } });

    await throwTE(
      api.Actor.Custom.PutSiblings({
        Params: { id: '1' },
        Body: { siblingId: 'new' },
        Query: { q: 1 },
        Headers: {},
      })
    );

    expect(axiosMock.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        url: '/actors/1/siblings',
        params: { q: 1 },
        data: { siblingId: 'new' },
        headers: expect.objectContaining({ Accept: 'application/json' }),
      })
    );

    const badDecode = () => (_: unknown) =>
      E.left(new IOError('Bad', { kind: 'DecodingError', errors: [] }));
    const api2 = GetResourceClient(axiosMock, TestEndpoints, { decode: badDecode });
    axiosMock.request.mockResolvedValue({ data: { data: { id: '1' } } });
    await expect(throwTE(api2.Actor.Get({ Params: { id: '1' } }))).rejects.toBeInstanceOf(IOError);

    const actor1 = {
      id: '1',
      name: 'actor 1',
      avatar: {
        id: 'a1',
        url: 'u1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      bornOn: null,
      diedOn: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    axiosMock.request.mockResolvedValue({ data: { data: actor1 } });
    await throwTE(api.Actor.Get({ Params: { id: '1' } }));
    expect(axiosMock.request).toHaveBeenCalledWith(
      expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) })
    );
  });

  it('has custom put endpoint returning siblings', async () => {
    const axiosMock = mock<AxiosInstance>();
    const api = GetResourceClient(axiosMock, TestEndpoints, { decode: decodeIdentity });

    axiosMock.request.mockResolvedValue({ data: { data: { id: '1', siblings: ['2'] } } });
    const result = await pipe(
      api.Actor.Custom.PutSiblings({
        Params: { id: '1' },
        Body: { siblingId: 'new-sibling' },
        Headers: {},
        Query: {},
      }),
      throwTE
    );
    expect(result).toMatchObject({ data: { id: '1', siblings: ['2'] } });
  });
});
