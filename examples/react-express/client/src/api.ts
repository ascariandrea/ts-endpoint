import { IOError, IOTSCodec } from '@ts-endpoint/core';
import { GetFetchHTTPClient } from '@ts-endpoint/http-client';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { getUser } from 'shared';

export const apiClient = GetFetchHTTPClient(
  {
    // proxy request through corsproxy server
    host: 'localhost:1337/localhost',
    protocol: 'http',
    port: 3000,
  },
  { getUser },
  {
    decode: (schema: IOTSCodec<any, any>) => (input: unknown) => {
      return pipe(
        schema.decode(input),
        E.mapLeft(
          (error) =>
            new IOError(`Decoding error: ${schema.name}`, {
              kind: 'DecodingError',
              errors: [error],
            })
        )
      );
    },
  }
);
