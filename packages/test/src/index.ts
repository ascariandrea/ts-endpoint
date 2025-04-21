import {
  IOError,
  type EffectCodec,
  type EndpointDecodeFn,
  type IOTSCodec,
} from '@ts-endpoint/core';
import { Schema } from 'effect';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
export * from './TestEndpoints/TestEndpointsEffect.js';

export const decodeIOTS: EndpointDecodeFn<IOError> =
  (schema: IOTSCodec<any, any>) => (input: unknown) => {
    return pipe(
      input,
      schema.decode,
      E.mapLeft((errors) => {
        return new IOError(`Failed to decode io-ts codec ${schema.name}`, {
          kind: 'DecodingError',
          errors,
        });
      })
    );
  };

export const decodeEffect: EndpointDecodeFn<IOError> =
  (schema: EffectCodec<any>) => (input: unknown) => {
    return pipe(
      input,
      Schema.decodeUnknownEither(schema as Schema.Schema<any>),
      E.mapLeft((errors) => {
        return new IOError(`Failed to decode effect codec`, {
          kind: 'DecodingError',
          errors: errors.message.split('\n'),
        });
      })
    );
  };
