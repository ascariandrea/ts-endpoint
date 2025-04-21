import { EffectCodec, IOError } from '@ts-endpoint/core';
import { GetResourceClient } from '@ts-endpoint/resource-client';
import { TestEndpoints } from '@ts-endpoint/test';
import axios from 'axios';
import { Schema } from 'effect';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const resourceClient = GetResourceClient(
  client,
  TestEndpoints,
  {
    decode: (schema: EffectCodec<any, any>) => (input: unknown) => {
      return pipe(
        input,
        Schema.decodeUnknownEither(schema as Schema.Schema<any>),
        E.mapLeft(
          (error) =>
            new IOError(`Decoding error: ${schema}`, {
              kind: 'DecodingError',
              errors: [error],
            })
        )
      );
    },
  }
);
