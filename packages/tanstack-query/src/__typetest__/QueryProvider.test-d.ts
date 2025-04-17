import { type API } from '@ts-endpoint/resource-client';
import { type TestEndpoints } from '@ts-endpoint/test';
import { describe, expectTypeOf, test } from 'vitest';
import { CreateQueryProvider } from '../QueryProvider.js';

declare const resourceClient: API<TestEndpoints>;

describe(CreateQueryProvider.name, () => {
  const queryProvider = CreateQueryProvider(resourceClient);
  test('should be defined', () => {
    // Test if the CreateQueryProvider function is defined
    expectTypeOf(queryProvider.Actor.get.getKey).parameter(0).toEqualTypeOf<{
      readonly id: string;
    }>();

    expectTypeOf(queryProvider.Actor.get.fetch)
      .parameter(0)
      .toEqualTypeOf<{ readonly id: string }>();

    // params
    expectTypeOf(queryProvider.Actor.get.useQuery).parameter(0).toEqualTypeOf<{
      readonly id: string;
    }>();
    // query parameter
    expectTypeOf(queryProvider.Actor.get.useQuery).parameter(1).toEqualTypeOf<undefined>();

    // "discrete" parameter
    expectTypeOf(queryProvider.Actor.get.useQuery)
      .parameter(2)
      .toEqualTypeOf<boolean | undefined>();

    // key parameter
    expectTypeOf(queryProvider.Actor.get.useQuery).parameter(3).toEqualTypeOf<string | undefined>();
  });
});
