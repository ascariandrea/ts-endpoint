import { Endpoint, IOError, IOTSCodec } from '@ts-endpoint/core';
import * as express from 'express';
import * as E from 'fp-ts/lib/Either.js';
import { left, right } from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';
import * as t from 'io-ts';
import { assertType, expectTypeOf, test } from 'vitest';
import { buildIOError, GetEndpointSubscriber } from '../index.js';

const getEndpoint = Endpoint({
  Input: {
    Params: t.type({ id: t.string }),
    Headers: t.type({ auth: t.string }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const postEndpoint = Endpoint({
  Input: {
    Body: t.type({ content: t.string }),
  },
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const postEndpointWithErrors = Endpoint({
  Input: {
    Body: t.type({ content: t.string }),
  },
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Errors: {
    404: t.type({ error: t.string }),
    401: t.type({ baz: t.string })
  },
});

const router = express.Router();
const registerRouter = GetEndpointSubscriber({
  buildDecodeError: buildIOError,
  decode: (schema) => (input: unknown) => {
    return pipe(
      input,
      (schema as IOTSCodec<any, any>).decode,
      E.mapLeft((errors) => {
        return new IOError('error', { kind: 'DecodingError', errors });
      })
    );
  },
});
const AddEndpoint = registerRouter(router);

declare module '../HKT.js' {
  interface URItoKind<A> {
    Option: O.Option<A>;
  }
}

test('AddEndpoint', () => {
  expectTypeOf(AddEndpoint).parameter(0).not.toMatchObjectType<undefined>;

  expectTypeOf(AddEndpoint).not.toEqualTypeOf<() => void>();

  assertType(
    // @ts-expect-error crayons is not a string
    AddEndpoint(getEndpoint, ({ params: { id } }) => () => {
      assertType<string>(id);
      return Promise.resolve(right({ body: { crayons: [22] }, statusCode: 200 }));
    })
  );

  assertType(
    // @ts-expect-error params bar doesn't exists
    AddEndpoint(getEndpoint, ({ params: { id, bar } }) => () => {
      assertType<string>(id);
      assertType<string>(bar);
      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
    })
  );

  assertType(
    // @ts-expect-error body doesn't exists
    AddEndpoint(getEndpoint, ({ params: { id }, body: { foo } }) => () => {
      assertType<string>(id)
      assertType<string>(foo);
      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
    })
  );

  assertType<void>(
    AddEndpoint(getEndpoint, ({ params: { id } }) => () => {
      assertType<string>(id);

      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 200 }));
    })
  );

  assertType(
    // @ts-expect-error post endpoint doesn't have params
    AddEndpoint(postEndpoint, ({ params: { id } }) => () => {
      assertType<string>(id);
      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 201 }));
    })
  );

  assertType(
    AddEndpoint(postEndpoint, ({ body: { content } }) => () => {
      assertType<string>(content);
      return Promise.resolve(right({ body: { crayons: ['brown'] }, statusCode: 201 }));
    })
  );

  assertType(
    // @ts-expect-error error not conforming to the schema
    AddEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
      assertType<string>(content);
      return Promise.resolve(left({ foo: 'baz' }));
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
});

test('Should work with Option kind', () => {
  const buildMaybeError = (errors: unknown) => {
    return O.some({
      kind: 'DecodingError',
      errors: [errors],
    });
  };

  const maybeRouter = express.Router();
  const registerMaybeRouter = GetEndpointSubscriber<'Option'>({
    buildDecodeError: buildMaybeError,
    decode: (schema) => (input: unknown) => {
      return pipe(
        input,
        (schema as IOTSCodec<any, any>).decode,
        E.mapLeft((errors) => {
          return O.some(new IOError('error', { kind: 'DecodingError', errors }));
        })
      );
    },
  });
  const AddMaybeEndpoint = registerMaybeRouter(maybeRouter);

  assertType(
    // @ts-expect-error you cannot return a badly formatted error with a different error builder
    AddMaybeEndpoint(postEndpointWithErrors, ({ body: { content } }) => () => {
      assertType<string>(content);

      return Promise.resolve(
        left(O.some({ kind: 'KnownError', status: 401, body: { error: 'foo' } }))
      );
    })
  );
});
