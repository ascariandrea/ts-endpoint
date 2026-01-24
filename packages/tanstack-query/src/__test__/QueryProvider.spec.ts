import { GetResourceClient } from '@ts-endpoint/resource-client';
import { decodeEffect } from '@ts-endpoint/test';
import { TestEndpoints } from '@ts-endpoint/test/lib/TestEndpoints/TestEndpointsEffect.js';
import { type AxiosInstance } from 'axios';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CreateQueryProvider } from '../QueryProvider.js';
import { TestQueryProviderOverrides } from './fixtures.js';

describe(CreateQueryProvider, () => {
  it('CreateQueryProvider merges Custom overrides into provider', async () => {
    const axiosMock = mock<AxiosInstance>();
    const resourceClient = GetResourceClient(axiosMock, TestEndpoints, {
      decode: decodeEffect,
    });

    const qp = CreateQueryProvider(resourceClient, TestQueryProviderOverrides);

    // original custom would yield 'c', override should yield 'OV'
    const res = await qp.Actor.Custom.Test.fetch({ id: '1' }, undefined);
    expect(res).toMatchObject({ data: [expect.objectContaining({ id: 'OV' })], total: 1 });
  });
});
