import {
  type StreamOutputCodec,
  type EndpointOutputType,
  type IOTSCodec,
  type ResourceEndpoints,
  type MinimalEndpointInstance,
} from '@ts-endpoint/core';
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
    // list.getKey second parameter is the query (runtime type)
  });

  test('QueryProvider', () => {
    type EndpointsQueryProvider = QueryProvider<TestEndpoints>;

    type ActorGet = EndpointsQueryProvider['Actor']['get'];

    expectTypeOf<ActorGet['getKey']>().parameter(0).toEqualTypeOf<{ readonly id: string }>();
  });

  test('Stream output conversion', () => {
    type StreamEndpointInstance = {
      getPath: (i?: any) => string;
      getStaticPath: (f?: any) => string;
      Method: 'GET';
      Input: undefined;
      Output: StreamOutputCodec<string, string>;
      Errors: undefined;
    };

    expectTypeOf<
      EndpointOutputType<StreamEndpointInstance>
    >().toEqualTypeOf<NodeJS.ReadableStream>();
  });

  test('Non-stream output conversion', () => {
    // Use a real test endpoint for non-stream sanity check
    expectTypeOf<EndpointOutputType<(typeof TestEndpoints)['Actor']['List']>>().toMatchTypeOf<{
      data: unknown;
    }>();
  });

  test('ResourceQueries with stream get', () => {
    type StreamEndpointInstance = {
      getPath: (i?: any) => string;
      getStaticPath: (f?: any) => string;
      Method: 'GET';
      Input: undefined;
      Output: StreamOutputCodec<string, string>;
      Errors: undefined;
    };

    type NonStreamEndpointInstance = {
      getPath: (i?: any) => string;
      getStaticPath: (f?: any) => string;
      Method: 'GET';
      Input: undefined;
      Output: IOTSCodec<{ data: string }, { data: string }>;
      Errors: undefined;
    };

    type RQ = ResourceQueries<StreamEndpointInstance, NonStreamEndpointInstance, undefined>;

    expectTypeOf<RQ['get']['fetch']>().returns.toEqualTypeOf<Promise<NodeJS.ReadableStream>>();
    expectTypeOf<RQ['list']['fetch']>().returns.toEqualTypeOf<
      Promise<EndpointOutputType<NonStreamEndpointInstance>>
    >();
  });

  test('QueryProvider maps streams', () => {
    type StreamEndpointInstance = {
      getPath: (i?: any) => string;
      getStaticPath: (f?: any) => string;
      Method: 'GET';
      Input: undefined;
      Output: StreamOutputCodec<string, string>;
      Errors: undefined;
    };

    type NonStreamEndpointInstance = {
      getPath: (i?: any) => string;
      getStaticPath: (f?: any) => string;
      Method: 'GET';
      Input: undefined;
      Output: IOTSCodec<{ data: string }, { data: string }>;
      Errors: undefined;
    };

    type ES = {
      Actor: ResourceEndpoints<
        StreamEndpointInstance & MinimalEndpointInstance,
        NonStreamEndpointInstance & MinimalEndpointInstance,
        NonStreamEndpointInstance & MinimalEndpointInstance,
        NonStreamEndpointInstance & MinimalEndpointInstance,
        NonStreamEndpointInstance & MinimalEndpointInstance,
        any
      >;
    };

    type Provider = QueryProvider<ES>;
    type ActorGet = Provider['Actor']['get'];

    expectTypeOf<ActorGet['fetch']>().returns.toEqualTypeOf<Promise<NodeJS.ReadableStream>>();
  });

  test('List query accepts serialized values', () => {
    type ActorList = ResourceQueries<
      (typeof TestEndpoints)['Actor']['Get'],
      (typeof TestEndpoints)['Actor']['List'],
      (typeof TestEndpoints)['Actor']['Custom']
    >['list'];

    type ActorListFetch = ActorList['fetch'];

    // ensure we can call the generated fetch with encoded (string) values
    const fetchFn = null as unknown as ActorListFetch;
    void fetchFn(undefined, { _end: '1', _start: '0', ids: ['1'] } as any);
  });
});
