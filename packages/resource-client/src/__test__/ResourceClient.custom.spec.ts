import { throwTE } from '@ts-endpoint/core/lib/utils.js';
import { TestEndpoints, decodeIdentity } from '@ts-endpoint/test';
import { type AxiosInstance } from 'axios';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { GetResourceClient } from '../ResourceClient.js';

describe('ResourceClient custom endpoints', () => {
  const axiosMock = mock<AxiosInstance>();

  const api = GetResourceClient(axiosMock, TestEndpoints, {
    decode: decodeIdentity,
  });

  it('Custom GetSiblings returns decoded array', async () => {
    const a2 = {
      id: '2',
      name: 'actor 2',
      avatar: {
        id: 'a2',
        url: 'u2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      bornOn: null,
      diedOn: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const a3 = {
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

    axiosMock.request.mockResolvedValue({ data: { data: [a2, a3] } });

    const res = await throwTE(
      api.Actor.Custom.GetSiblings({ Params: { id: '1' }, Body: {}, Headers: {}, Query: {} })
    );

    expect(res).toEqual({ data: [a2, a3] });
  });

  it('Custom PutSiblings accepts body and returns list', async () => {
    const a1 = {
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
    const a2 = {
      id: '2',
      name: 'actor 2',
      avatar: {
        id: 'a2',
        url: 'u2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      bornOn: null,
      diedOn: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    axiosMock.request.mockResolvedValue({ data: { data: [a1, a2] } });

    const res = await throwTE(
      api.Actor.Custom.PutSiblings({
        Params: { id: '1' },
        Body: { siblingId: '2' },
        Headers: {},
        Query: {},
      })
    );

    expect(res).toEqual({ data: [a1, a2] });
  });
});
