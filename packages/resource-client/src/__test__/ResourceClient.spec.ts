import { throwTE } from '@ts-endpoint/core/lib/utils.js';
import { TestEndpoints } from '@ts-endpoint/test';
import { type AxiosInstance } from 'axios';
import { pipe } from 'fp-ts/lib/function.js';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { GetResourceClient } from '../ResourceClient.js';

describe(GetResourceClient.name, () => {
  const axiosMock = mock<AxiosInstance>();

  const identityDecode = () => (i: unknown) => ({ _tag: 'Right', right: i }) as any;

  const api = GetResourceClient(axiosMock, TestEndpoints, {
    decode: identityDecode,
  });

  it('should be defined', () => {
    expect(api.Actor.Get).toBeDefined();
    expect(api.Actor.Create).toBeDefined();
    expect(api.Actor.Edit).toBeDefined();
    expect(api.Actor.List).toBeDefined();
  });

  it('Get resolves with decoded data', async () => {
    axiosMock.request.mockResolvedValue({ data: { data: { id: '1' } } } as any);

    const res = await pipe(api.Actor.Get({ Params: { id: '1' } }), throwTE);

    expect(res).toEqual({ data: { id: '1' } });
  });

  it('Has custom put endpoint', async () => {
    axiosMock.request.mockResolvedValue({ data: { data: { id: '1', siblings: ['2'] } } } as any);

    const result = await pipe(
      api.Actor.Custom.PutSiblings({
        Params: { id: '1' },
        Body: { siblingId: 'new-sibling' },
        // TODO: should not be required
        Headers: {},
        Query: {},
      }),
      throwTE
    );
    expect(result).toMatchObject({ data: { id: '1', siblings: ['2'] } });
  });
});
