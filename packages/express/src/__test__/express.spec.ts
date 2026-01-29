import { decodeEffect, TestEndpoints } from '@ts-endpoint/test';
import type * as express from 'express';
import * as E from 'fp-ts/lib/Either.js';
import { describe, it, expect, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import * as Controller from '../Controller.js';
import type { Controller as ControllerType } from '../Controller.js';
import * as HTTPResponse from '../HTTPResponse.js';
import { GetEndpointSubscriber, buildIOError } from '../index.js';

describe('exports smoke', () => {
  it('exports GetEndpointSubscriber (if present)', () => {
    expect(GetEndpointSubscriber ?? undefined).toBeDefined();
  });

  it('Controller module loads without throwing', () => {
    expect(Controller === undefined || typeof Controller === 'object').toBeTruthy();
  });

  it('HTTPResponse utilities load without throwing', () => {
    expect(HTTPResponse === undefined || typeof HTTPResponse === 'object').toBeTruthy();
  });
});

it('GetEndpointSubscriber decodes params and calls controller', async () => {
  const { GetEndpointSubscriber } = await import('../index.js');
  const { decodeEffect, TestEndpoints } = await import('@ts-endpoint/test');

  const router = mock<express.Router>();
  const registered: express.RequestHandler[] = [];
  router.get.mockImplementation((...args: any[]) => {
    const handlers = args.slice(1) as express.RequestHandler[];
    registered.push(...handlers);
    return router as unknown as express.Router;
  });

  const add = GetEndpointSubscriber({
    decode: decodeEffect,
    buildDecodeError: buildIOError,
  })(router);

  let capturedArgs: unknown = null;

  const controller = vi.fn((args: unknown) => {
    capturedArgs = args;
    return () =>
      Promise.resolve(E.right({ statusCode: 200, body: { ok: true }, headers: { 'x-ok': '1' } }));
  }) as unknown as ControllerType<any, any, any, any, any, any>;

  add(TestEndpoints.Actor.Get, controller);

  // handler is last registered
  const handler = registered[registered.length - 1];

  const req = mock<express.Request>();
  Object.assign(req, { params: { id: 'actor-1' }, headers: {}, query: {}, body: {} });

  const res = mock<express.Response>();
  let resHeaders: Record<string, string> = {};
  let resStatus = 0;
  let resBody: unknown = undefined;
  res.set.mockImplementation((...args: any[]) => {
    const h = args[0];
    if (typeof h === 'object') resHeaders = h as Record<string, string>;
    return res;
  });
  res.status.mockImplementation((code: number) => {
    resStatus = code;
    return res;
  });
  res.send.mockImplementation((b: unknown) => {
    resBody = b;
    return res;
  });

  const next = (e?: unknown) => {
    if (e) throw e as Error;
  };

  // invoke handler and wait a tick for async task
  await handler(req, res, next);
  await new Promise((r) => setTimeout(r, 0));

  expect(capturedArgs).not.toBeNull();
  expect((capturedArgs as any).params).toEqual({ id: 'actor-1' });
  expect(resStatus).toBe(200);
  expect(resBody).toEqual({ ok: true });
  expect(resHeaders['x-ok']).toBe('1');
});

it('GetEndpointSubscriber calls next on decode errors', async () => {
  const router = mock<express.Router>();
  const registered: express.RequestHandler[] = [];
  router.get.mockImplementation((...args: any[]) => {
    const handlers = args.slice(1) as express.RequestHandler[];
    registered.push(...handlers);
    return router;
  });

  const add = GetEndpointSubscriber({
    decode: decodeEffect,
    buildDecodeError: buildIOError,
  })(router);

  let controllerCalled = false;
  const controller2 = vi.fn((_args: unknown) => {
    controllerCalled = true;
    return () => Promise.resolve(E.right({ statusCode: 200, body: {} }));
  }) as unknown as ControllerType<any, any, any, any, any, any>;

  add(TestEndpoints.Actor.Get, controller2);

  const handler2 = registered[registered.length - 1];

  const req2 = mock<express.Request>();
  Object.assign(req2, { params: {}, headers: {}, query: {}, body: {} });
  let nextErr: unknown = null;
  const next = (e?: unknown) => {
    nextErr = e;
  };

  await handler2(req2, {} as express.Response, next);

  // wait a tick for async task runner to run and call next
  await new Promise((r) => setTimeout(r, 0));

  expect(controllerCalled).toBeFalsy();
  expect(nextErr).not.toBeNull();
});

it('GetEndpointSubscriber sends string body and content-type header', async () => {
  const router = mock<express.Router>();
  const registered3: express.RequestHandler[] = [];
  router.get.mockImplementation((...args: any[]) => {
    const handlers = args.slice(1) as express.RequestHandler[];
    registered3.push(...handlers);
    return router as unknown as express.Router;
  });

  const add = GetEndpointSubscriber({
    decode: decodeEffect,
    buildDecodeError: buildIOError,
  })(router);

  const controller = (_args: unknown) => () =>
    Promise.resolve({
      _tag: 'Right',
      right: { statusCode: 201, body: 'created', headers: { 'content-type': 'text/plain' } },
    } as unknown);

  add(TestEndpoints.Actor.Get as any, controller as any);

  const handler3 = registered3[registered3.length - 1];

  const req3 = mock<express.Request>();
  Object.assign(req3, { params: { id: 'actor-2' }, headers: {}, query: {}, body: {} });

  const res3 = mock<express.Response>();
  let res3Headers: Record<string, string> = {};
  let res3Status = 0;
  let res3Body: unknown = undefined;
  res3.set.mockImplementation(((...args: any[]) => {
    const h = args[0];
    if (typeof h === 'object') res3Headers = h as Record<string, string>;
    return res3;
  }) as any);
  res3.status.mockImplementation(((code: number) => {
    res3Status = code;
    return res3;
  }) as any);
  res3.send.mockImplementation(((b: unknown) => {
    res3Body = b;
    return res3;
  }) as any);

  const next = (e?: unknown) => {
    if (e) throw e as Error;
  };

  await handler3(req3, res3, next);
  await new Promise((r) => setTimeout(r, 0));

  expect(res3Status).toBe(201);
  expect(res3Body).toBe('created');
  expect(res3Headers['content-type']).toBe('text/plain');
});
