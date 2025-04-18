import * as t from 'io-ts';
import { expectTypeOf, test } from 'vitest';
import { Endpoint } from '../Endpoint.js';

const endpointInstance = Endpoint({
  Input: {
    Query: t.type({ color: t.string }),
    Params: t.type({ id: t.string }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const endpointWithParam = Endpoint({
  Input: {
    Query: t.type({ color: t.string }),
    Params: t.type({ id: t.number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const endpointWithoutParam = Endpoint({
  Input: {
    Query: t.type({ color: t.string }),
  },
  Method: 'GET',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const endpointWithErrors = Endpoint({
  Input: {
    Query: t.type({ color: t.string }),
    Params: t.type({ id: t.number }),
  },
  Method: 'GET',
  getPath: ({ id }) => `users/${id.toString()}/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Errors: {
    401: t.undefined,
    404: t.type({ message: t.string }),
    500: t.type({ foo: t.number }),
  },
});

const endpointWithoutInput = Endpoint({
  Method: 'GET',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
});

const endpointWithBody = Endpoint({
  Method: 'POST',
  getPath: () => `users/crayons`,
  Output: t.type({ crayons: t.array(t.string) }),
  Input: { Body: t.type({ id: t.number }) },
});

test('Endpoint', () => {
  expectTypeOf(endpointInstance.Input.Params.props.id).toEqualTypeOf<t.StringC>();

  expectTypeOf(endpointInstance.Input.Query.props.color).toEqualTypeOf<t.StringC>();

  expectTypeOf(endpointWithoutParam.getPath()).toEqualTypeOf<string>();

  expectTypeOf(endpointInstance.Input.Body).not.toMatchObjectType<{ prova: any }>();

  expectTypeOf(endpointInstance.Output.props).not.toMatchObjectType<{ fakeOutput: any }>();

  expectTypeOf(endpointInstance.Output.props.crayons).toEqualTypeOf<t.ArrayC<t.StringC>>();

  expectTypeOf(endpointWithBody.Input.Body.props.id).toEqualTypeOf<t.NumberC>();

  expectTypeOf(endpointInstance.Errors).toEqualTypeOf<undefined>();
  expectTypeOf(endpointWithErrors.Errors).toMatchObjectType<{
    401: t.UndefinedC;
  }>();

  expectTypeOf(endpointWithParam.getPath).parameter(0).not.toEqualTypeOf<undefined>();
  expectTypeOf(endpointWithParam.getPath).parameter(0).not.toEqualTypeOf<{ foo: number }>();
  expectTypeOf(endpointWithParam.getPath).parameter(0).not.toEqualTypeOf<{ foo: string }>();
  expectTypeOf(endpointWithParam.getPath).parameter(0).not.toEqualTypeOf<{ id: string }>();

  expectTypeOf(endpointWithParam.getPath).parameter(0).toEqualTypeOf<{ id: number }>();

  expectTypeOf(endpointWithParam.getStaticPath)
    .parameter(0)
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    .not.toEqualTypeOf<undefined | {}>();

  expectTypeOf(endpointWithParam.getStaticPath)
    .parameter(0)
    .toEqualTypeOf<(paramName: 'id') => string>();

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  expectTypeOf(endpointWithoutParam.getStaticPath).parameter(0).toEqualTypeOf<{} | undefined>();

  expectTypeOf(endpointWithoutParam.getPath).parameter(0).toEqualTypeOf<undefined>();

  expectTypeOf(endpointWithoutInput.getPath).parameter(0).toEqualTypeOf<undefined>();
});
