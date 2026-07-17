import { Schema } from 'effect';
import { expectTypeOf, test } from 'vitest';
import { StreamOutput, type StreamOutputCodec } from '../Codec.js';
import { Endpoint } from '../Endpoint.js';

const streamEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/stream`,
  Output: StreamOutput(Schema.Struct({ id: Schema.Number })),
});

const nonStreamEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/data`,
  Output: Schema.Struct({ data: Schema.String }),
});

test('Stream property types', () => {
  // Stream endpoint should have Stream = true
  expectTypeOf(streamEndpoint.Output).toEqualTypeOf<
    StreamOutputCodec<
      {
        readonly id: number;
      },
      {
        readonly id: number;
      }
    >
  >();

  // Non-stream endpoint should not have a Stream property
  expectTypeOf(nonStreamEndpoint.Output).toEqualTypeOf<
    Schema.Struct<{
      data: typeof Schema.String;
    }>
  >();
});

test('Stream endpoint preserves other properties', () => {
  expectTypeOf(streamEndpoint.Method).toEqualTypeOf<'GET'>();
  expectTypeOf(streamEndpoint.Input.Params.fields.id).toEqualTypeOf<typeof Schema.Number>();
  // Output is a StreamOutput marker for stream endpoints, so we don't assert fields here.
});
