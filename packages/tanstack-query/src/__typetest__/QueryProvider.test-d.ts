import { API } from '@ts-endpoint/resource-client';
import { TestEndpoints } from '@ts-endpoint/test';
import { describe, expectTypeOf, test } from 'vitest';
import { CreateQueryProvider } from '../QueryProvider.js';

declare const resourceClient: API<TestEndpoints>;

describe(CreateQueryProvider.name, () => {
  const queryProvider = CreateQueryProvider(resourceClient);
  test('should be defined', () => {
    // Test if the CreateQueryProvider function is defined
    expectTypeOf(queryProvider.Actor.get.getKey).parameter(0).toEqualTypeOf<{
      readonly id: string;
    }>;

    expectTypeOf(queryProvider.Actor.get.fetch).parameter(0).toEqualTypeOf<{ readonly id: string }>;
    expectTypeOf(queryProvider.Actor.get.useQuery).parameters.toEqualTypeOf<{
      0: { id: string };
      1: undefined;
      2: boolean | undefined;
      3: string | undefined;
    }>;
  });
});
