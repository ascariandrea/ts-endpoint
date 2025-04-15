import { TestEndpoints } from '@ts-endpoint/test';
import { describe, expectTypeOf, test } from 'vitest';
import { QueryProvider, ResourceQueries, ResourceQuery } from '../types.js';

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

    expectTypeOf<RQ['getKey']>().parameter(0).toEqualTypeOf<{ id: string }>;
    expectTypeOf<RQ['getKey']>().parameter(1).toEqualTypeOf<
      | {
          filter: { id: string };
          pagination: { page: number; size: number };
          sort: { field: string; order: 'asc' | 'desc' };
        }
      | undefined
    >;
  });
  test('ResourceQueries', () => {
    type RR = ResourceQueries<
      (typeof TestEndpoints)['Actor']['Get'],
      (typeof TestEndpoints)['Actor']['List'],
      (typeof TestEndpoints)['Actor']['Custom']
    >;
    expectTypeOf<RR['get']['getKey']>().parameter(0).toEqualTypeOf<{ id: string }>;
    // expectTypeOf<RR['list']['fetch']>().parameters.toEqualTypeOf<{
    //   0: {
    //     filter: {};
    //   };
    //   1: {};
    //   2: boolean | undefined;
    // }>;
  });

  test('QueryProvider', () => {
    type EndpointsQueryProvider = QueryProvider<TestEndpoints>;
    expectTypeOf<EndpointsQueryProvider['Actor']['get']['getKey']>().parameters.toEqualTypeOf<{
      0: { id: string };
      1: undefined;
      2: boolean | undefined;
      3: string | undefined;
    }>;
  });
});
