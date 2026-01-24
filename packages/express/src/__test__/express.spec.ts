import { describe, it, expect } from 'vitest';
import * as Controller from '../Controller.js';
import * as HTTPResponse from '../HTTPResponse.js';
import { GetEndpointSubscriber } from '../index.js';

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

  const router: any = {
    registered: [] as any[],
    path: '',
    get(path: string, ...handlers: any[]) {
      this.path = path;
      this.registered = handlers;
    },
  };

  const add = GetEndpointSubscriber({
    decode: decodeEffect,
    buildDecodeError: (e: any) => e,
  })(router);

  let capturedArgs: any = null;

  const controller = (args: any) => {
    capturedArgs = args;
    return () =>
      Promise.resolve({
        _tag: 'Right',
        right: { statusCode: 200, body: { ok: true }, headers: { 'x-ok': '1' } },
      } as any);
  };

  add(TestEndpoints.Actor.Get as any, controller as any);

  // handler is last registered
  const handler = router.registered[router.registered.length - 1];

  const req: any = { params: { id: 'actor-1' }, headers: {}, query: {}, body: {} };
  const res: any = {
    _headers: {},
    _status: 0,
    _body: undefined,
    set(h: any) {
      this._headers = h;
    },
    status(code: number) {
      this._status = code;
      return this;
    },
    send(b: any) {
      this._body = b;
    },
  };

  const next = (e?: any) => {
    if (e) throw e;
  };

  // invoke handler and wait a tick for async task
  handler(req, res, next);
  await new Promise((r) => setTimeout(r, 0));

  expect(capturedArgs).not.toBeNull();
  expect(capturedArgs.params).toEqual({ id: 'actor-1' });
  expect(res._status).toBe(200);
  expect(res._body).toEqual({ ok: true });
  expect(res._headers['x-ok']).toBe('1');
});
