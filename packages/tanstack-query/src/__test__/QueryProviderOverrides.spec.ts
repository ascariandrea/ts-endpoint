import { expect, it } from 'vitest';
import { toOverrideQueries } from '../QueryProviderOverrides.js';
import {
  type ActorSiblingsOverrideQueries,
  ActorSiblingsResourceOverrides,
  mockApiForOverrides,
} from './fixtures.js';

it('toOverrideQueries creates custom fetch that delegates to provided API', async () => {
  const oq = toOverrideQueries(
    mockApiForOverrides,
    'actors',
    ActorSiblingsResourceOverrides
  ) as ActorSiblingsOverrideQueries;
  const custom = oq.Custom?.GetSiblings;
  const val = await custom!.fetch({ id: '1' }, undefined);
  expect(val).toEqual({ data: [{ id: 's1' }], total: 1 });
});
