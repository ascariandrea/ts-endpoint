import { describe, it, expect } from 'vitest';
import { BaseError } from '../error/BaseError.js';

describe('BaseError', () => {
  it('sets stack when Error.captureStackTrace missing', () => {
    const orig = (Error as any).captureStackTrace;
    try {
      (Error as any).captureStackTrace = undefined;
      const be = new BaseError(123, 'msg', { foo: 'bar' });
      expect(be.status).toBe(123);
      expect(be.message).toBe('msg');
      expect(be.details).toEqual({ foo: 'bar' });
      expect(typeof be.stack).toBe('string');
    } finally {
      (Error as any).captureStackTrace = orig;
    }
  });
});
