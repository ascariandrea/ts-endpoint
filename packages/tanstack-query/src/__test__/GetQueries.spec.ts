import type { MinimalEndpointInstance } from '@ts-endpoint/core';
import { IOError } from '@ts-endpoint/core';
import type { EndpointRequest, EndpointREST } from '@ts-endpoint/resource-client';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { describe, it, expect } from 'vitest';
import {
  getDefaultKey,
  fetchQuery,
  toGetListResourceQuery,
  toQueries,
  emptyQuery,
} from '../GetQueries.js';

describe('GetQueries helpers (consolidated)', () => {
  it('getDefaultKey builds predictable keys and prefixing', () => {
    const gk = getDefaultKey('list');
    const key = gk({ id: 1 }, { q: 'a' }, true, 'pref');
    expect(key[0]).toBe('pref-list');
    expect(key[1]).toEqual({ id: 1 });
    expect(key[2]).toEqual({ q: 'a' });
    expect(key[3]).toBe(true);

    const k = getDefaultKey('actor')({}, undefined, false, 'p');
    expect(Array.isArray(k)).toBe(true);
    expect(k[0]).toBe('p-actor');
  });

  it('emptyQuery resolves to expected shape', async () => {
    const out = await emptyQuery();
    expect(out).toEqual({ data: [], total: 0 });
  });

  it('fetchQuery handles discrete short-circuit and TaskEither delegation', async () => {
    const f1 = fetchQuery((_p: any, _q: any) => TE.right({ data: [1], total: 1 }));

    // discrete with empty filter -> empty result
    const res = await f1({ filter: {} }, undefined, true);
    expect(res).toEqual(await emptyQuery());

    // discrete with ids empty -> empty result
    const res2 = await f1({ filter: { ids: [] } }, undefined, true);
    expect(res2).toEqual(await emptyQuery());

    // non-discrete uses underlying task
    const res3 = await f1({ filter: { ids: [1] } }, undefined, false);
    expect(res3).toEqual({ data: [1], total: 1 });

    // discrete that returns IOError should short-circuit to empty
    const fetchFnErr = (_p: any, _q: any) =>
      TE.left(new IOError('no', { kind: 'ClientError', status: '500' } as any));
    const f2 = fetchQuery(fetchFnErr as any);
    const resErr = await f2({ filter: { ids: [] } }, undefined, true);
    expect(resErr).toEqual({ data: [], total: 0 });
  });

  it('toGetListResourceQuery builds key and fetch delegates to provided function', async () => {
    const getListFn = (_input: unknown) => TE.right({ data: [{ id: '1' }], total: 1 });

    const rq = toGetListResourceQuery(getListFn as unknown as EndpointRequest<any>, 'actors');

    const fetched = await rq.fetch({ page: 1 }, { q: 'x' });
    expect(fetched).toEqual({ data: [{ id: '1' }], total: 1 });

    const key = rq.getKey({ page: 1 }, { q: 'x' }, false, 'pref');
    expect(key[0]).toBe('pref-actors');
  });

  it('toQueries handles Custom endpoints and uses key prefixing and mapping', async () => {
    const getFn = (_p: unknown) => TE.right({ data: { id: '1' } });
    const listFn = (_p: unknown) => TE.right({ data: [{ id: '1' }], total: 1 });
    const customFn = (_p: unknown) => TE.right({ data: [{ id: '2' }], total: 1 });

    const e = {
      Get: getFn,
      List: listFn,
      Custom: { Test: customFn },
    } as unknown as EndpointREST<any, any, any, any, any, Record<'Test', MinimalEndpointInstance>>;

    const qs = toQueries('actors', e);

    const custom = qs.Custom.Test;
    const val = await custom.fetch(undefined, undefined);
    expect(val).toEqual({ data: [{ id: '2' }], total: 1 });

    const ck = custom.getKey(undefined, undefined, false, 'p');
    expect(typeof ck[0]).toBe('string');
    expect(ck[0].startsWith('p-actors-Test')).toBeTruthy();

    const q = toQueries('res', {
      Get: () => TE.right({ data: { id: '1' } }),
      List: () => TE.right({ data: [{ id: '1' }], total: 1 }),
      Custom: {},
    } as any);
    const g = await q.get.fetch({} as any, undefined as any);
    expect((g as any).data).toEqual({ id: '1' });
    const l = await q.list.fetch({} as any, undefined as any);
    expect((l as any).data).toEqual([{ id: '1' }]);
  });
});
