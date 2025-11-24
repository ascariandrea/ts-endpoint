import { Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { Endpoint } from '../Endpoint.js';

describe('Endpoint', () => {
  const endpointWithParam = Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.Number }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id.toString()}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  });

  const endpointWithoutParam = Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
    },
    Method: 'GET',
    getPath: () => `users/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  });

  it('adds the params correctly', () => {
    expect(endpointWithParam.getStaticPath((param) => `:${param}`)).toEqual('/users/:id/crayons');
    expect(endpointWithoutParam.getStaticPath()).toEqual('/users/crayons');
  });

  it('getPath adds the params correctly', () => {
    expect(endpointWithParam.getPath({ id: 3 })).toEqual('/users/3/crayons');
    expect(endpointWithoutParam.getPath()).toEqual('/users/crayons');
  });

  it('Endpoint logs an error when defining headers with spaces', () => {
    Endpoint({
      Input: {
        Query: Schema.Struct({ color: Schema.String }),
        Headers: Schema.Struct({ 'Content type': Schema.String }),
      },
      Method: 'GET',
      getPath: () => `users/crayons`,
      Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
    });
  });

  it('creates an endpoint with Stream property set to true', () => {
    const streamEndpoint = Endpoint({
      Input: {
        Params: Schema.Struct({ id: Schema.Number }),
      },
      Method: 'GET',
      getPath: ({ id }) => `users/${id.toString()}/stream`,
      Output: Schema.Struct({ data: Schema.String }),
      Stream: true,
    });

    expect(streamEndpoint.Stream).toBe(true);
  });

  it('creates an endpoint with Stream property set to false', () => {
    const nonStreamEndpoint = Endpoint({
      Input: {
        Params: Schema.Struct({ id: Schema.Number }),
      },
      Method: 'GET',
      getPath: ({ id }) => `users/${id.toString()}/data`,
      Output: Schema.Struct({ data: Schema.String }),
      Stream: false,
    });

    expect(nonStreamEndpoint.Stream).toBe(false);
  });

  it('creates an endpoint without Stream property (undefined)', () => {
    const regularEndpoint = Endpoint({
      Input: {
        Params: Schema.Struct({ id: Schema.Number }),
      },
      Method: 'GET',
      getPath: ({ id }) => `users/${id.toString()}/data`,
      Output: Schema.Struct({ data: Schema.String }),
    });

    expect(regularEndpoint.Stream).toBeUndefined();
  });
});
