import { IOError } from '@ts-endpoint/core';
import { it, expect } from 'vitest';
import { dataProviderRequestLift } from '../RAEndpointsClient.js';

it('maps axios-like errors to IOError with response data and statusText', async () => {
  const axiosLike: any = {
    isAxiosError: true,
    message: 'not found',
    response: { statusText: '404', data: { foo: 'bar' } },
  };

  const te = dataProviderRequestLift(
    () => Promise.reject(axiosLike as Error),
    // decoder that would succeed (not reached)
    (() => (a: any) => ({ _tag: 'Right', right: a }) as any) as any
  );

  const res = await te();
  expect(res._tag).toBe('Left');
  const left = (res as any).left as IOError;
  expect(left).toBeInstanceOf(IOError);
  expect(left.message).toBe('not found');
  expect(left.details).toMatchObject({ kind: 'ClientError', meta: { foo: 'bar' } });
});

it('passes through IOError instances unchanged', async () => {
  const err = new IOError('boom', { kind: 'ClientError', status: '500' });

  const te = dataProviderRequestLift(
    () => Promise.reject(err),
    (() => (a: any) => ({ _tag: 'Right', right: a }) as any) as any
  );
  const res = await te();
  expect(res._tag).toBe('Left');
  const left = (res as any).left as IOError;
  expect(left).toBe(err);
});

it('wraps Error instances into IOError', async () => {
  const te = dataProviderRequestLift(
    () => Promise.reject(new Error('ohno')),
    (() => (a: any) => ({ _tag: 'Right', right: a }) as any) as any
  );
  const res = await te();
  expect(res._tag).toBe('Left');
  const left = (res as any).left as IOError;
  expect(left.message).toBe('ohno');
});

it('wraps unknown rejections into generic IOError', async () => {
  const te = dataProviderRequestLift(
    () => Promise.reject(123 as any as Error),
    (() => (a: any) => ({ _tag: 'Right', right: a }) as any) as any
  );
  const res = await te();
  expect(res._tag).toBe('Left');
  const left = (res as any).left as IOError;
  expect(left.message).toBe('Unknown error');
  expect(left.details).toMatchObject({ meta: 123 });
});
