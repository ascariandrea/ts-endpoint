import { IOError } from '@ts-endpoint/core';
import { GetResourceClient } from '@ts-endpoint/resource-client';
import { TestEndpoints } from '@ts-endpoint/test';
import type { AxiosInstance } from 'axios';
import { parseISO, subYears } from 'date-fns';
import { Schema } from 'effect';
import fc from 'fast-check';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { afterEach, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CreateQueryProvider } from '../QueryProvider.js';

describe('QueryProvider', () => {
  const axiosMock = mock<AxiosInstance>();
  const resourceClient = GetResourceClient(axiosMock, TestEndpoints, {
    decode: (schema) => (data: unknown) => {
      return pipe(
        data,
        Schema.decodeUnknownEither(schema as Schema.Schema<any>),
        E.mapLeft((e) => {
          return new IOError('DecodeError', { kind: 'DecodingError', errors: [e] });
        })
      );
    },
  });
  const Q = CreateQueryProvider(resourceClient);

  const actorData = fc.sample(
    fc.record({
      id: fc.uuid(),
      name: fc.string(),
      avatar: fc.record({
        id: fc.uuid(),
        url: fc.string(),
        createdAt: fc.date().map((d) => d.toISOString()),
        updatedAt: fc.date().map((d) => d.toISOString()),
      }),
      bornOn: fc.option(
        fc.date().map((d) => d.toISOString()),
        { nil: null }
      ),
      diedOn: fc.option(
        fc.date({ min: subYears(new Date(), 200) }).map((d) => d.toISOString()),
        { nil: null }
      ),
      createdAt: fc.date().map((d) => d.toISOString()),
      updatedAt: fc.date().map((d) => d.toISOString()),
    }),
    10
  );

  const toExpectedActor = (a: any) => ({
    ...a,
    avatar: {
      ...a.avatar,
      createdAt: parseISO(a.avatar.createdAt),
      updatedAt: parseISO(a.avatar.updatedAt),
    },
    bornOn: a.bornOn ? new Date(a.bornOn) : null,
    diedOn: a.diedOn ? new Date(a.diedOn) : null,
    updatedAt: parseISO(a.updatedAt),
    createdAt: parseISO(a.createdAt),
  });

  afterEach(() => {
    axiosMock.get.mockReset();
    axiosMock.request.mockReset();
  });

  it('should be defined', () => {
    expect(Q).toBeTruthy();
    expect(Q.Actor.get.getKey).toBeInstanceOf(Function);
    expect(Q.Actor.get.fetch).toBeInstanceOf(Function);
    expect(Q.Actor.get.useQuery).toBeInstanceOf(Function);
  });

  it('should have Actor get', async () => {
    const firstActor = actorData[0];

    axiosMock.request.mockResolvedValue({
      data: { data: firstActor },
    });

    const params = { id: '1' };
    const actorKey = Q.Actor.get.getKey(params);

    const actor = await Q.Actor.get.fetch(params, undefined);

    expect(actorKey).toEqual(['Actor', params, undefined, false]);

    expect(axiosMock.request).toHaveBeenCalledWith({
      url: '/actors/1',
      method: 'GET',
      data: undefined,
      headers: {
        Accept: 'application/json',
      },
      responseType: 'json',
    });

    expect(actor).toMatchObject({ data: toExpectedActor(firstActor) });
  });

  it('should have Actor getList', async () => {
    const actorList = [...actorData].slice(0, 2);
    axiosMock.request.mockResolvedValue({
      data: { data: actorList, total: 2 },
    });

    expect(Q.Actor.list).toBeDefined();
    const params = {
      pagination: { perPage: 1, page: 1 },
      filter: { ids: ['1'] },
    };
    const actorKey = Q.Actor.list.getKey(params);
    expect(actorKey).toEqual(['Actor', params, undefined, false]);
    const actor = await Q.Actor.list.fetch(params);

    expect(axiosMock.request).toHaveBeenCalledWith({
      url: '/actors',
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      params: {
        filter: {
          ids: ['1'],
        },
        ids: ['1'],
        pagination: {
          perPage: 1,
          page: 1,
        },
      },
      data: undefined,
      responseType: 'json',
    });
    expect(actor).toMatchObject({
      data: actorList.map(toExpectedActor),
      total: 2,
    });
  });

  it('should have Actor Custom Query', async () => {
    const data = [...actorData].slice(0, 1);

    axiosMock.request.mockResolvedValue({ data: { data } });

    expect(Q.Actor.Custom).toBeDefined();

    const actorParams = { id: '1' };
    const actorKey = Q.Actor.Custom.GetSiblings.getKey(actorParams);
    expect(actorKey).toEqual(['Actor-GetSiblings', actorParams, undefined, false]);

    const actor = await Q.Actor.Custom.GetSiblings.fetch(actorParams);

    expect(axiosMock.request).toHaveBeenCalledWith({
      data: undefined,
      params: undefined,
      method: 'GET',
      url: '/actors/1/siblings',
      responseType: 'json',
      headers: {
        Accept: 'application/json',
      },
    });
    expect(actor).toMatchObject({
      data: data.map(toExpectedActor),
    });
  });
});
