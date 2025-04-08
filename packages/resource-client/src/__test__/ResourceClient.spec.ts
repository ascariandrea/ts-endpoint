import { IOError } from '@ts-endpoint/core';
import { TestEndpoints } from '@ts-endpoint/test';
import { type AxiosInstance } from 'axios';
import { Schema } from 'effect';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { GetResourceClient } from '../ResourceClient.js';

describe(GetResourceClient.name, () => {
  const axiosMock = mock<AxiosInstance>();
  const api = GetResourceClient(axiosMock, TestEndpoints, {
    decode: (s) => (u) =>
      pipe(
        u,
        Schema.encodeUnknownEither(s as Schema.Schema<any>),
        E.mapLeft(
          (e) =>
            new IOError(e.message, {
              kind: 'NetworkError',
              status: '500',
              meta: e,
            })
        )
      ),
  });

  it('should be defined', () => {
    expect(api.Actor).toMatchObject({
      Get: expect.any(Function),
      Create: expect.any(Function),
      Edit: expect.any(Function),
      List: expect.any(Function),
      Custom: {
        GetSiblings: expect.anything(),
      },
    });

    expect(api.Actor).toMatchObject({
      Get: expect.any(Function),
      Create: expect.any(Function),
      Edit: expect.any(Function),
      List: expect.any(Function),
      Custom: {},
    });
  });
});
