import { decodeEffect, TestEndpoints } from '@ts-endpoint/test';
import { assertType } from 'vitest';
import type { APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient } from '../RAEndpointsClient.js';
import type {
  CreateFn,
  CustomEndpointFn,
  DeleteFn,
  EditFn,
  EndpointsRESTClient,
  GetFn,
  GetListFn,
} from '../types.js';

declare const apiClient: APIRESTClient;

const client = RAEndpointsClient(apiClient, { decode: decodeEffect })(TestEndpoints);

assertType<EndpointsRESTClient<typeof TestEndpoints>>(client);

assertType<APIRESTClient>(client.client);

assertType<GetFn<typeof TestEndpoints.Actor.Get>>(client.Endpoints.Actor.get);
assertType<GetListFn<typeof TestEndpoints.Actor.List>>(client.Endpoints.Actor.getList);
assertType<CreateFn<typeof TestEndpoints.Actor.Create>>(client.Endpoints.Actor.post);
assertType<EditFn<typeof TestEndpoints.Actor.Edit>>(client.Endpoints.Actor.edit);
assertType<DeleteFn<typeof TestEndpoints.Actor.Delete>>(client.Endpoints.Actor.delete);
assertType<CustomEndpointFn<typeof TestEndpoints.Actor.Custom.PutSiblings>>(
  client.Endpoints.Actor.Custom.PutSiblings
);
