import { getUser } from 'shared';
import { GetFetchHTTPClient } from '@ts-endpoint/http-client';
import { IOError, IOTSCodec } from '@ts-endpoint/core';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';

export const apiClient = GetFetchHTTPClient(
  {
    // proxy request through corsproxy server
    host: 'localhost:1337/localhost',
    protocol: 'http',
    port: 3000,
  },
  { getUser },
  {
    decode: (schema) => (input) => {
      const s = schema as IOTSCodec<any, any>;
      return pipe(
        s.decode(input),
        E.mapLeft(
          (error) =>
            new IOError(`Decoding error: ${s.name}`, {
              kind: 'DecodingError',
              errors: [error],
            })
        )
      );
    },
  }
);
