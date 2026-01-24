import { decodeEffect, TestEndpoints } from '@ts-endpoint/test';
import { assertType } from 'vitest';
import type { APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient } from '../RAEndpointsClient.js';
import type { EndpointsRESTClient } from '../types.js';

declare const apiClient: APIRESTClient;

const client = RAEndpointsClient(apiClient, { decode: decodeEffect })(TestEndpoints);

assertType<EndpointsRESTClient<typeof TestEndpoints>>(client);
