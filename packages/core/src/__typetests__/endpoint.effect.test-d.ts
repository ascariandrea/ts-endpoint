import { Schema } from 'effect';
import { assertType, expectTypeOf, test } from 'vitest';
import { Endpoint, type BodyInput, type EndpointInstanceEncodedParams } from '../Endpoint.js';

const endpointInstance = Endpoint({
  Input: {
    Query: Schema.Struct({ color: Schema.String }),
    Params: Schema.Struct({ id: Schema.String }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const endpointWithParam = Endpoint({
  Input: {
    Query: Schema.Struct({ color: Schema.String }),
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const endpointWithoutParam = Endpoint({
  Input: {
    Query: Schema.Struct({
      color: Schema.String,
      status: Schema.OptionFromNullishOr(Schema.String, null),
    }),
  },
  Method: 'GET',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const endpointWithErrors = Endpoint({
  Input: {
    Query: Schema.Struct({ color: Schema.String }),
    Params: Schema.Struct({ id: Schema.Number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  Errors: {
    401: Schema.Undefined,
    404: Schema.Struct({ message: Schema.String }),
    500: Schema.Struct({ foo: Schema.Number }),
  },
});

const endpointWithoutInput = Endpoint({
  Method: 'GET',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const endpointWithBody = Endpoint({
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  Input: { Body: Schema.Struct({ id: Schema.Number }) },
});

const endpointWithFilteredBody = Endpoint({
  Method: 'PATCH',
  getPath: () => `users/update`,
  Output: Schema.Struct({ ok: Schema.Boolean }),
  Input: {
    Body: Schema.Struct({ name: Schema.String, age: Schema.Number }).pipe(
      Schema.filter((s) => s.name.length > 0)
    ),
  },
});

test('Should match the types', () => {
  expectTypeOf(endpointInstance.Input.Params.fields.id).toEqualTypeOf<typeof Schema.String>();

  expectTypeOf(endpointInstance.Input.Query.fields.color).toEqualTypeOf<typeof Schema.String>();

  expectTypeOf(endpointWithoutParam.getPath).toEqualTypeOf<(args?: undefined) => string>();
  expectTypeOf(endpointInstance.Input.Body).toEqualTypeOf<undefined>();

  expectTypeOf(endpointInstance.Output.fields.crayons).toEqualTypeOf<
    Schema.Array$<typeof Schema.String>
  >();

  // assertType<
  //   {
  //     401: typeof Schema.Undefined;
  //     404: typeof Schema.Struct<{ message: typeof Schema.String }>;
  //     500: typeof Schema.Struct<{ foo: typeof Schema.Number }>;
  //   }
  // >(endpointWithErrors.Errors);

  expectTypeOf(endpointWithParam.getPath).not.toEqualTypeOf<(i?: undefined) => string>();

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  expectTypeOf(endpointWithParam.getPath).not.toEqualTypeOf<(i?: {}) => string>();

  expectTypeOf(endpointWithParam.getStaticPath).not.toEqualTypeOf<() => string>();

  expectTypeOf(endpointWithParam.getStaticPath((param) => `:${param}`)).toEqualTypeOf<string>();

  expectTypeOf(endpointWithoutParam.getStaticPath()).toEqualTypeOf<string>();

  expectTypeOf(endpointWithoutParam.getPath()).toEqualTypeOf<string>();

  expectTypeOf(endpointWithoutInput.getPath).toEqualTypeOf<(i?: undefined) => string>();

  expectTypeOf(endpointWithErrors.Errors).toEqualTypeOf<{
    401: typeof Schema.Undefined;
    404: Schema.Struct<{ message: typeof Schema.String }>;
    500: Schema.Struct<{ foo: typeof Schema.Number }>;
  }>();

  expectTypeOf(endpointWithBody.Input.Body).toEqualTypeOf<
    Schema.Struct<{ id: typeof Schema.Number }>
  >();

  assertType<EndpointInstanceEncodedParams<typeof endpointWithBody>['Input']['Body']>({
    id: 1,
  });

  // BodyInput strips filter/brand wrappers from Body, giving a plain Partial of the serialized type.
  // This allows callers to construct the payload without a cast even when the server uses a
  // filter-constrained schema (e.g. nonEmptyRecordFromType).
  assertType<BodyInput<typeof endpointWithFilteredBody>>({ name: 'Alice' });
  assertType<BodyInput<typeof endpointWithFilteredBody>>({ age: 30 });
  assertType<BodyInput<typeof endpointWithFilteredBody>>({});
  expectTypeOf<BodyInput<typeof endpointWithFilteredBody>>().toMatchObjectType<
    Partial<{ readonly name: string; readonly age: number }>
  >();

  // BodyInput returns `never` when the endpoint has no Body
  expectTypeOf<BodyInput<typeof endpointInstance>>().toEqualTypeOf<never>();
});
