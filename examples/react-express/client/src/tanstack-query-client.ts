import { EndpointOutputType, MinimalEndpointInstance } from '@ts-endpoint/core';
import {
  CreateQueryProvider,
  CustomQueryOverride,
  defaultUseQueryListParams,
  QueryProviderOverrides,
  ResourceEndpointsQueriesOverride,
} from '@ts-endpoint/tanstack-query';
import { TestEndpoints } from '@ts-endpoint/test';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { resourceClient } from './resource-client';

const GetByName: CustomQueryOverride<
  TestEndpoints,
  string,
  undefined,
  EndpointOutputType<typeof TestEndpoints.Actor.Get>['data']
> = (Q) => (p) => {
  return pipe(
    Q.Actor.List({ ...defaultUseQueryListParams, Query: { ids: [p], _start: "1", _end: "1" } }),
    TE.map((r) => r.data[0])
  );
};

const ActorOverride: ResourceEndpointsQueriesOverride<
  TestEndpoints,
  MinimalEndpointInstance,
  MinimalEndpointInstance,
  {
    GetByName: typeof GetByName;
  }
> = {
  Custom: {
    GetByName,
  },
};

const overrides: QueryProviderOverrides<
  TestEndpoints,
  {
    Actor: typeof ActorOverride;
  }
> = {
  Actor: ActorOverride,
};

export const QueryProvider = CreateQueryProvider(resourceClient, overrides);
