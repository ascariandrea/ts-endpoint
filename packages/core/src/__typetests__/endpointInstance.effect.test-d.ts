import { Schema } from 'effect';
import * as O from 'effect/Option';
import { assertType, describe, expectTypeOf, it } from 'vitest';
import { Endpoint, type EndpointInstanceEncodedInputs } from '../Endpoint.js';

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
    Params: Schema.Struct({ id: Schema.Number }),
    Query: Schema.Struct({
      color: Schema.String,
      status: Schema.OptionFromNullishOr(Schema.String, null),
    }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
});

const endpointWithoutParam = Endpoint({
  Input: {
    Query: Schema.Struct({ color: Schema.String }),
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

describe('EndpointInstance', () => {
  it('Should match the types', () => {
    expectTypeOf(endpointInstance.Input.Params.fields.id).toEqualTypeOf<typeof Schema.String>();
    expectTypeOf(endpointInstance.Input.Query.fields.color).toEqualTypeOf<typeof Schema.String>();

    expectTypeOf(endpointInstance.getStaticPath).toEqualTypeOf<
      (param: (paramName: keyof typeof endpointInstance.Input.Params.Type) => string) => string
    >();

    expectTypeOf(endpointInstance.Input.Body).not.toMatchObjectType<{ prova: true }>();

    expectTypeOf(endpointInstance.Output.fields).not.toMatchObjectType<{ fakeOutput: never }>();

    assertType<readonly string[]>(endpointInstance.Output.fields.crayons.Type);

    expectTypeOf(endpointWithErrors.Errors).toEqualTypeOf<{
      401: typeof Schema.Undefined;
      404: Schema.Struct<{ message: typeof Schema.String }>;
      500: Schema.Struct<{ foo: typeof Schema.Number }>;
    }>();

    expectTypeOf(endpointWithParam.getPath).parameter(0).not.toEqualTypeOf<null>();

    expectTypeOf(endpointWithParam.getPath).not.toEqualTypeOf({});

    expectTypeOf(endpointWithParam.getPath).not.toEqualTypeOf({ id: '' });

    expectTypeOf(endpointWithParam.getPath)
      .parameter(0)
      .toMatchObjectType<{ readonly id: number }>();

    expectTypeOf(endpointWithParam.getStaticPath).not.toEqualTypeOf<() => string>();

    expectTypeOf(endpointWithParam.getStaticPath((param) => `:${param}`)).toEqualTypeOf<string>();

    expectTypeOf(endpointWithoutParam.getStaticPath()).toEqualTypeOf<string>();

    expectTypeOf(endpointWithoutParam.getPath).toEqualTypeOf<(i?: undefined) => string>();
    expectTypeOf(endpointWithoutParam.getPath()).toEqualTypeOf<string>();

    expectTypeOf(endpointWithParam.Input.Query).not.toMatchObjectType<never>();
    expectTypeOf(endpointWithParam.Input.Query).not.toEqualTypeOf<{
      color: string;
      status?: string;
    }>();

    assertType<EndpointInstanceEncodedInputs<typeof endpointWithParam>['Query']>({
      color: 'red',
      status: O.none<string>(),
    });
  });
});
