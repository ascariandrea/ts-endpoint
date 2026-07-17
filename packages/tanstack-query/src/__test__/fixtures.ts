import { type EndpointOutputType, type EndpointParamsType } from '@ts-endpoint/core';
import { type API } from '@ts-endpoint/resource-client';
import { Arb, type TestEndpoints } from '@ts-endpoint/test';
import { type Actor } from '@ts-endpoint/test/lib/TestEndpoints/TestEndpointsEffect.js';
import { FastCheck } from 'effect';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import {
  type CustomQueryOverride,
  type QueryProviderOverrides,
  type ResourceEndpointsQueriesOverride,
} from '../QueryProviderOverrides.js';
import { type ResourceQuery } from '../types.js';

/**
 * A custom query override for testing that returns an actor list with id 'OV'.
 * Returns the same shape as Actor.List endpoint: { data: Actor[], total: number }
 */
export const ActorTestOverride: CustomQueryOverride<
  TestEndpoints,
  EndpointParamsType<typeof TestEndpoints.Actor.Get>,
  EndpointParamsType<typeof TestEndpoints.Actor.Get>,
  EndpointOutputType<typeof TestEndpoints.Actor.List>
> = (_api) => (_p, _q) =>
  pipe(
    FastCheck.sample(Arb.ActorArb, 1),
    (ar) => [{ ...ar[0], id: 'OV' }],
    (data) => TE.right({ data, total: 1 })
  );

/**
 * Resource overrides for Actor endpoints.
 */
export const ActorResourceOverrides: ResourceEndpointsQueriesOverride<
  TestEndpoints,
  undefined,
  undefined,
  {
    Test: typeof ActorTestOverride;
  }
> = {
  Custom: {
    Test: ActorTestOverride,
  },
};

/**
 * Query provider overrides for testing.
 */
export const TestQueryProviderOverrides: QueryProviderOverrides<
  TestEndpoints,
  {
    Actor: typeof ActorResourceOverrides;
  }
> = { Actor: ActorResourceOverrides };

/**
 * Custom query override for GetSiblings that returns a list with a single sibling.
 * Uses List output type to include total count.
 */
export const GetSiblingsOverride: CustomQueryOverride<
  TestEndpoints,
  EndpointParamsType<typeof TestEndpoints.Actor.Custom.GetSiblings>,
  undefined,
  EndpointOutputType<typeof TestEndpoints.Actor.List>
> = (_api) => (_p, _q) => TE.right({ data: [{ id: 's1' } as Actor], total: 1 });

/**
 * Resource overrides for Actor including GetSiblings custom override.
 * Uses actual endpoint types for Get and List to satisfy toOverrideQueries type constraints.
 */
export const ActorSiblingsResourceOverrides: ResourceEndpointsQueriesOverride<
  TestEndpoints,
  typeof TestEndpoints.Actor.Get,
  typeof TestEndpoints.Actor.List,
  {
    GetSiblings: typeof GetSiblingsOverride;
  }
> = {
  Custom: {
    GetSiblings: GetSiblingsOverride,
  },
};

/**
 * Mock API that returns the GetSiblings override via Actor.Custom.GetSiblings.
 */
export const mockApiForOverrides: API<TestEndpoints> = {
  Actor: {
    Custom: {
      GetSiblings: GetSiblingsOverride,
      PutSiblings: () => TE.right({ data: [] as Actor[] }),
    },
  },
} as unknown as API<TestEndpoints>;

/**
 * Type for the result of toOverrideQueries with GetSiblings custom query.
 * This provides proper typing for the Custom.GetSiblings resource query.
 */
export interface ActorSiblingsOverrideQueries {
  Custom?: {
    GetSiblings: ResourceQuery<
      EndpointParamsType<typeof TestEndpoints.Actor.Custom.GetSiblings>,
      undefined,
      undefined,
      EndpointOutputType<typeof TestEndpoints.Actor.List>
    >;
  };
}
