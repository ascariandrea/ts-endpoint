import { type Codec, Endpoint, IOError } from '@ts-endpoint/core';
import { Schema } from 'effect';
import * as express from 'express';
import * as E from 'fp-ts/lib/Either.js';
import * as O from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';
import { assertType, describe, expectTypeOf, test } from 'vitest';
import { buildIOError, GetEndpointSubscriber } from '../index.js';

const getEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.UUID }),
    Query: Schema.Struct({ foo: Schema.OptionFromNullishOr(Schema.String, null) }),
    Headers: Schema.Struct({ auth: Schema.String }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const postEndpoint = Endpoint({
  Input: {
    Body: Schema.Struct({ content: Schema.String }),
  },
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const putEndpoint = Endpoint({
  Input: {
    Params: Schema.Struct({ id: Schema.UUID }),
    Body: Schema.Struct({ content: Schema.String }),
  },
  Method: 'PUT',
  getPath: ({ id }) => `users/crayons/${id}`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const postEndpointWithErrors = Endpoint({
  Input: {
    Body: Schema.Struct({ content: Schema.String }),
  },
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String), createdAt: Schema.Date }),
  Errors: {
    404: Schema.Struct({ error: Schema.String }),
    401: Schema.Struct({ baz: Schema.String }),
  },
});

const router = express.Router();

const decode =
  <A, I, E = any>(s: Codec<A, I, E>, _parseOptions?: any) =>
  (input: unknown, _transformOptions?: any): E.Either<IOError, any> => {
    return pipe(
      input,
      Schema.decodeUnknownEither(s as any),
      E.mapLeft((e) => buildIOError([e]))
    );
  };

const decodeOption =
  <A, I, E = any>(s: Codec<A, I, E>, _parseOptions?: any) =>
  (input: unknown, _transformOptions?: any): E.Either<O.Option<IOError>, any> => {
    return pipe(
      input,
      Schema.decodeUnknownEither(s as any),
      E.mapLeft((e) => O.some(buildIOError([e])))
    );
  };

const registerRouter = GetEndpointSubscriber({ buildDecodeError: buildIOError, decode });
const AddEndpoint = registerRouter(router);

declare module '../HKT.js' {
  interface URItoKind<A> {
    Option: O.Option<A>;
  }
}

describe('AddEndpoint', () => {
  test('Should match the types', () => {
    expectTypeOf(AddEndpoint).not.toEqualTypeOf<() => void>();

    assertType(
      // @ts-expect-error crayons is not a string
      AddEndpoint(getEndpoint, ({ params: { id } }) => () => {
        assertType<string>(id);
        return Promise.resolve(
          E.right({
            body: {
              crayons: [22],
            },
            statusCode: 200,
          })
        );
      })
    );

    assertType(
      // @ts-expect-error params bar doesn't exists
      AddEndpoint(getEndpoint, ({ params: { id, bar } }) => () => {
        assertType<string>(id);
        assertType<string>(bar);
        return Promise.resolve(E.right({ body: { crayons: ['brown'] }, statusCode: 200 }));
      })
    );

    assertType(
      // @ts-expect-error body doesn't exists
      AddEndpoint(getEndpoint, ({ params: { id }, body: { foo } }) => () => {
        assertType<string>(id);
        assertType<string>(foo);
        return Promise.resolve(E.right({ body: { crayons: ['brown'] }, statusCode: 200 }));
      })
    );

    assertType<void>(
      AddEndpoint(getEndpoint, ({ params: { id } }) => () => {
        assertType<string>(id);
        return Promise.resolve(E.right({ body: { crayons: ['brown'] }, statusCode: 200 }));
      })
    );

    assertType<void>(
      AddEndpoint(getEndpoint, ({ params: { id }, query: { foo } }) => () => {
        assertType<string>(id);
        assertType<O.Option<string>>(foo);

        return Promise.resolve(E.right({ body: { crayons: ['brown'] }, statusCode: 200 }));
      })
    );

    assertType(
      // @ts-expect-error post endpoint doesn't have params
      AddEndpoint(postEndpoint, ({ params: { id } }) => () => {
        assertType<string>(id);
        return Promise.resolve(E.right({ body: { crayons: ['brown'] }, statusCode: 201 }));
      })
    );

    assertType(
      AddEndpoint(postEndpoint, ({ body: { content } }) => () => {
        assertType<string>(content);
        return Promise.resolve(E.right({ body: { crayons: ['brown'] }, statusCode: 201 }));
      })
    );

    assertType(
      AddEndpoint(putEndpoint, ({ params: { id }, body: { content } }) => () => {
        assertType<string>(id);
        assertType<string>(content);
        return Promise.resolve(E.right({ body: { crayons: ['brown'] }, statusCode: 201 }));
      })
    );

    assertType(
      // @ts-expect-error error not conforming to the schema
      AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
        assertType<string>(content);
        return Promise.resolve(E.left({ foo: 'baz' }));
      })
    );

    assertType(
      AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
        assertType<string>(content);

        // @ts-expect-error error kind not conforming to the schema
        return Promise.resolve(left(new IOError('error', { kind: 'KnownError', error: 'foo' })));
      })
    );

    assertType(
      AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
        assertType<string>(content);

        return Promise.resolve(
          // @ts-expect-error error kind and status not conforming to the schema
          left(new IOError('error', { kind: 'KnownError', status: 401, body: { error: 'foo' } }))
        );
      })
    );

    test('Should work with Option kind', () => {
      const buildMaybeError = (errors: unknown) => {
        return O.some({
          kind: 'DecodingError',
          errors,
        });
      };

      const maybeRouter = express.Router();
      const registerMaybeRouter = GetEndpointSubscriber<'Option'>({
        buildDecodeError: buildMaybeError,
        decode: decodeOption,
      });
      const AddMaybeEndpoint = registerMaybeRouter(maybeRouter);

      assertType(
        // @ts-expect-error you cannot return a badly formatted error with a different error builder
        AddMaybeEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
          assertType<string>(content);

          return Promise.resolve(
            E.left(O.some({ kind: 'KnownError', status: 401, body: { error: 'foo' } }))
          );
        })
      );
    });
  });
});
