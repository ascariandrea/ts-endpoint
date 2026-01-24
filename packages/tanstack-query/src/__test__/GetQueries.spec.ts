import * as TE from 'fp-ts/lib/TaskEither.js';
import { describe, it, expect } from 'vitest';
import {
  getDefaultKey,
  fetchQuery,
  toGetListResourceQuery,
  toQueries,
  emptyQuery,
} from '../GetQueries.js';

describe('GetQueries helpers', () => {
  it('getDefaultKey builds predictable keys', () => {
    const gk = getDefaultKey('list');
    const key = gk({ id: 1 }, { q: 'a' }, true, 'pref');
    expect(key[0]).toBe('pref-list');
    expect(key[1]).toEqual({ id: 1 });
    expect(key[2]).toEqual({ q: 'a' });
    expect(key[3]).toBe(true);
  });

  it('fetchQuery returns emptyQuery when discrete and no ids/filter', async () => {
    const f = fetchQuery((_p: any, _q: any) => TE.right({ data: [1], total: 1 }));

    // discrete with empty filter -> empty result
    const res = await f({ filter: {} } as any, undefined as any, true);
    expect(res).toEqual(await emptyQuery());

    // discrete with ids empty -> empty result
    const res2 = await f({ filter: { ids: [] } } as any, undefined as any, true);
    expect(res2).toEqual(await emptyQuery());

    // non-discrete uses underlying task
    const res3 = await f({ filter: { ids: [1] } } as any, undefined as any, false);
    expect(res3).toEqual({ data: [1], total: 1 });
  });

  it('toGetListResourceQuery builds key and fetch delegates to provided function', async () => {
    const getListFn = (_input: any) => TE.right({ data: [{ id: '1' }], total: 1 });

    const rq = toGetListResourceQuery(getListFn as any, 'actors');

    const fetched = await rq.fetch({ page: 1 } as any, { q: 'x' } as any);
    expect(fetched).toEqual({ data: [{ id: '1' }], total: 1 });

    const key = rq.getKey({ page: 1 } as any, { q: 'x' } as any, false, 'pref');
    expect(key[0]).toBe('pref-actors');
  });

  it('toQueries handles Custom endpoints and uses key prefixing', async () => {
    const getFn = (_p: any) => TE.right({ data: { id: '1' } });
    const listFn = (_p: any) => TE.right({ data: [{ id: '1' }], total: 1 });
    const customFn = (_p: any) => TE.right({ data: [{ id: '2' }], total: 1 });

    const e = {
      Get: getFn,
      List: listFn,
      Custom: { Test: customFn },
    } as any;

    const qs = toQueries('actors', e);

    const custom = qs.Custom.Test;
    const val = await custom.fetch({ id: '1' } as any, undefined as any);
    expect(val).toEqual({ data: [{ id: '2' }], total: 1 });

    const ck = custom.getKey({ id: '1' } as any, undefined as any, false, 'p');
    expect(typeof ck[0]).toBe('string');
    expect(ck[0].startsWith('p-actors-Test')).toBeTruthy();
  });
});
