import { assertType, expectTypeOf, test } from 'vitest';
import { ResourceEndpoints, type ResourceEndpointsTypeOf } from '../ResourceEndpoint.js';
import { CreateCrayon, GetUserCrayons, ListCrayons } from '../__test__/endpoints.samples.js';

test('ResourceEndpoints', () => {
  expectTypeOf(ResourceEndpoints).parameter(0).not.toEqualTypeOf<object>();

  const resourceEndpoints = ResourceEndpoints({
    Get: GetUserCrayons,
    List: ListCrayons,
    Create: CreateCrayon,
    Edit: CreateCrayon,
    Delete: CreateCrayon,
    Custom: {},
  });

  assertType<ResourceEndpointsTypeOf<typeof resourceEndpoints>['Get']['Input']['Params']>({
    id: 1,
  });
});
