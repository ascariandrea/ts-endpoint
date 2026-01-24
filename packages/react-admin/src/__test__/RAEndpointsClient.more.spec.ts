import { throwTE } from '@ts-endpoint/core/lib/utils.js';
import { TestEndpoints } from '@ts-endpoint/test';
import { describe, it, expect } from 'vitest';
import { mock } from 'vitest-mock-extended';
import type { APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient } from '../RAEndpointsClient.js';

describe('RAEndpointsClient additional', () => {
  it('getList and Custom endpoints return data', async () => {
    const apiRESTClient = mock<APIRESTClient>();
    apiRESTClient.getList.mockResolvedValue({ data: { data: [{ id: '1' }], total: 1 } } as any);
    apiRESTClient.request.mockResolvedValue({ data: { data: [{ id: '2' }], total: 1 } } as any);

    const client = RAEndpointsClient(apiRESTClient, {
      decode: (_s: any) => (i: any) => ({ _tag: 'Right', right: i }) as any,
    })(TestEndpoints);

    const list = await throwTE(client.Endpoints.Actor.getList({} as any));
    expect(list).toEqual({ data: { data: [{ id: '1' }], total: 1 } });

    const custom = await throwTE(
      client.Endpoints.Actor.Custom.GetSiblings({ Params: { id: '1' } } as any)
    );
    expect(custom).toEqual({ data: { data: [{ id: '2' }], total: 1 } });
  });
});
