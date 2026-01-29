import { type API } from '@ts-endpoint/resource-client';
import { type TestEndpoints } from '@ts-endpoint/test';
import { describe, expectTypeOf, test } from 'vitest';
import { toQueries } from '../GetQueries.js';
import { type ResourceQueries } from '../types.js';

declare const resourceClient: API<TestEndpoints>;

describe('GetQueries', () => {
  test(toQueries.name, () => {
    const resourceQuery = toQueries('test', resourceClient.Actor, undefined);
    expectTypeOf(resourceQuery).toEqualTypeOf<
      ResourceQueries<
        typeof TestEndpoints.Actor.Get,
        typeof TestEndpoints.Actor.List,
        typeof TestEndpoints.Actor.Custom
      >
    >();
  });
});
