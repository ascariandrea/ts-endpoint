import { Endpoint, ResourceEndpoints } from '@ts-endpoint/core';
import { Schema } from 'effect';
import { Actor } from './io/Actor.io.js';

const TestEndpoints = {
  Actor: ResourceEndpoints({
    Get: Endpoint({
      Method: 'GET',
      getPath: ({ id }) => `/actors/${id}`,
      Input: { Params: Schema.Struct({ id: Schema.String }), Query: undefined },
      Output: Schema.Struct({ data: Actor }),
    }),
    List: Endpoint({
      Method: 'GET',
      getPath: () => `/actors`,
      Input: {
        Query: Schema.Struct({
          _start: Schema.NumberFromString,
          _end: Schema.NumberFromString,
          ids: Schema.Array(Schema.String),
        }),
      },
      Output: Schema.Struct({ data: Schema.Array(Actor), total: Schema.Number }),
    }),
    Create: Endpoint({
      Method: 'POST',
      getPath: () => `/actors`,
      Input: { Body: Actor },
      Output: Schema.Struct({ data: Actor }),
    }),
    Edit: Endpoint({
      Method: 'PUT',
      getPath: ({ id }) => `/actors/${id}`,
      Input: {
        Params: Schema.Struct({ id: Schema.String }),
        Body: Actor,
      },
      Output: Schema.Struct({ data: Actor }),
    }),
    Delete: Endpoint({
      Method: 'DELETE',
      getPath: ({ id }) => `/actors/${id}`,
      Input: { Params: Schema.Struct({ id: Schema.String }) },
      Output: Schema.Boolean,
    }),
    Custom: {
      GetSiblings: Endpoint({
        Method: 'GET',
        getPath: ({ id }) => `/actors/${id}/siblings`,
        Input: { Params: Schema.Struct({ id: Schema.String }) },
        Output: Schema.Struct({ data: Schema.Array(Actor) }),
      }),
      PutSiblings: Endpoint({
        Method: 'PUT',
        getPath: ({ id }) => `/actors/${id}/siblings`,
        Input: {
          Params: Schema.Struct({ id: Schema.String }),
          Body: Schema.Struct({ siblingId: Schema.String }),
        },
        Output: Schema.Struct({ data: Schema.Array(Actor) }),
      }),
    },
  }),
};

type TestEndpoints = typeof TestEndpoints;

export { Actor, TestEndpoints };
