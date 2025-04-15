import { Schema } from 'effect';
import { mapLeft } from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { IOError } from 'ts-io-error';
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { APIRESTClient } from '../ApiRestClient.js';
import { RAEndpointsClient } from '../RAEndpointsClient.js';
import { TestEndpoints } from "./TestEndpoints.js";

describe("EndpointsRESTClient", () => {
  const apiRESTClient = mock<APIRESTClient>();
  const apiClient = RAEndpointsClient(apiRESTClient, {
    decode: (s) => (u) => pipe(
      u,
      Schema.decodeUnknownEither(s as Schema.Schema<any>),
      mapLeft(
        (_) =>
          new IOError('Validation error', {
            kind: 'DecodingError',
            errors: [],
          })
      )
    )
  })(TestEndpoints);

  it("should be defined", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.Endpoints.Actor.get).toBeDefined();
    expect(apiClient.Endpoints.Actor.getList).toBeDefined();
    expect(apiClient.Endpoints.Actor.Custom.GetSiblings).toBeDefined();
  });
});
