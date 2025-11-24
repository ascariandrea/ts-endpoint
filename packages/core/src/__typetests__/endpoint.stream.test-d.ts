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

test('Stream property types', () => {
  // Stream endpoint should have Stream = true
  expectTypeOf(streamEndpoint.Stream).toEqualTypeOf<true>();

  // Non-stream endpoint should have Stream = false
  expectTypeOf(nonStreamEndpoint.Stream).toEqualTypeOf<false>();
});

test('Stream endpoint preserves other properties', () => {
  expectTypeOf(streamEndpoint.Method).toEqualTypeOf<'GET'>();
  expectTypeOf(streamEndpoint.Input.Params.fields.id).toEqualTypeOf<typeof Schema.Number>();
  expectTypeOf(streamEndpoint.Output.fields.data).toEqualTypeOf<typeof Schema.String>();
});
