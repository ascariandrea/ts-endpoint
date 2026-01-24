import { expect, it } from 'vitest';
import { BaseError } from '../error/BaseError.js';
import { IOError } from '../error/DecodingError.js'; // Assuming IOError is exported from DecodingError.js

it('BaseError and DecodingError load and construct', () => {
  const e = new BaseError(500, 'msg');
  expect(e.message).toBeDefined();
});

it('IOError maps DecodingError to 600 status', () => {
  const err = new IOError('failed', { kind: 'DecodingError', errors: ['x'] } as any);
  expect(err.status).toBe(600);
});
