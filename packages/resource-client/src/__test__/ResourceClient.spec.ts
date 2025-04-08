import { decodeEffect, TestEndpoints } from '@ts-endpoint/test';
import { type AxiosInstance } from 'axios';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { GetResourceClient } from '../ResourceClient.js';

describe(GetResourceClient.name, () => {
  const axiosMock = mock<AxiosInstance>();
  const api = GetResourceClient(axiosMock, TestEndpoints, {
    decode: decodeEffect,
  });

  it('should be defined', () => {
    expect(api.Actor).toMatchObject({
      Get: expect.any(Function),
      Create: expect.any(Function),
      Edit: expect.any(Function),
      List: expect.any(Function),
      Custom: {
        GetSiblings: expect.anything(),
      },
    });

    expect(api.Actor).toMatchObject({
      Get: expect.any(Function),
      Create: expect.any(Function),
      Edit: expect.any(Function),
      List: expect.any(Function),
      Custom: {},
    });
  });
});
