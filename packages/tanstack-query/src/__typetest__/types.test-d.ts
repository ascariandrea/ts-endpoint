import { type TestEndpoints } from '@ts-endpoint/test';
import { describe, expectTypeOf, test } from 'vitest';
import { type QueryProvider, type ResourceQueries, type ResourceQuery } from '../types.js';

describe('types', () => {
  test('ResourceQuery', () => {
    type RQ = ResourceQuery<
      { id: string },
      {
        filter: {
          id: string;
        };
        pagination: {
          page: number;
          size: number;
        };
        sort: {
          field: string;
          order: 'asc' | 'desc';
        };
      },
      { id: string }
    >;

    expectTypeOf<RQ['getKey']>().parameter(0).toEqualTypeOf<{ id: string }>();
    expectTypeOf<RQ['getKey']>().parameter(1).toEqualTypeOf<
      | {
          filter: { id: string };
          pagination: { page: number; size: number };
          sort: { field: string; order: 'asc' | 'desc' };
        }
      | undefined
    >();
  });
  test('ResourceQueries', () => {
    type RR = ResourceQueries<
      (typeof TestEndpoints)['Actor']['Get'],
      (typeof TestEndpoints)['Actor']['List'],
      (typeof TestEndpoints)['Actor']['Custom']
    >;
    expectTypeOf<RR['get']['getKey']>().parameter(0).toEqualTypeOf<{ readonly id: string }>();
  });

  test('QueryProvider', () => {
    type EndpointsQueryProvider = QueryProvider<TestEndpoints>;

    type ActorGet = EndpointsQueryProvider['Actor']['get'];

    expectTypeOf<ActorGet['getKey']>().parameter(0).toEqualTypeOf<{ readonly id: string }>();
  });
});
