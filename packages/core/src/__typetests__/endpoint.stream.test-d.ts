import { Schema } from 'effect';
import { expectTypeOf, test } from 'vitest';
import { Endpoint } from '../Endpoint.js';

const streamEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/stream`,
  Output: Schema.Struct({ data: Schema.String }),
  Stream: true,
});

const nonStreamEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/data`,
  Output: Schema.Struct({ data: Schema.String }),
  Stream: false,
});

const regularEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/data`,
  Output: Schema.Struct({ data: Schema.String }),
});

test('Stream property types', () => {
  // Stream endpoint should have Stream property
  expectTypeOf(streamEndpoint.Stream).toEqualTypeOf<boolean | undefined>();

  // Non-stream endpoint should have Stream property
  expectTypeOf(nonStreamEndpoint.Stream).toEqualTypeOf<boolean | undefined>();

  // Regular endpoint should have Stream as optional
  expectTypeOf(regularEndpoint.Stream).toEqualTypeOf<boolean | undefined>();

  // Runtime checks
  if (streamEndpoint.Stream !== undefined) {
    expectTypeOf(streamEndpoint.Stream).toEqualTypeOf<boolean>();
  }
});

test('Stream endpoint preserves other properties', () => {
  expectTypeOf(streamEndpoint.Method).toEqualTypeOf<'GET'>();
  expectTypeOf(streamEndpoint.Input.Params.fields.id).toEqualTypeOf<typeof Schema.Number>();
  expectTypeOf(streamEndpoint.Output.fields.data).toEqualTypeOf<typeof Schema.String>();
});
