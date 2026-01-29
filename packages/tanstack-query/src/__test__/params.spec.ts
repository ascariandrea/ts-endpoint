import { it, expect } from 'vitest';
import { defaultUseQueryListParams } from '../params.js';

it('defaultUseQueryListParams has expected shape', () => {
  expect(defaultUseQueryListParams).toBeDefined();
  expect(defaultUseQueryListParams.pagination).toEqual({ page: 1, perPage: 40 });
  expect(defaultUseQueryListParams.sort).toEqual({ field: 'id', order: 'ASC' });
  expect(defaultUseQueryListParams.filter).toEqual({});
});
