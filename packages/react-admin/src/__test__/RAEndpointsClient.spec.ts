import { decodeEffect, TestEndpoints } from '@ts-endpoint/test';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { type APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient } from '../RAEndpointsClient.js';

describe('EndpointsRESTClient', () => {
  const apiRESTClient = mock<APIRESTClient>();
  const apiClient = RAEndpointsClient(apiRESTClient, {
    decode: decodeEffect,
  })(TestEndpoints);

  it('should be defined', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.Endpoints.Actor.get).toBeDefined();
    expect(apiClient.Endpoints.Actor.getList).toBeDefined();
    expect(apiClient.Endpoints.Actor.Custom.GetSiblings).toBeDefined();
  });
});
