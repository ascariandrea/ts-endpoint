import { describe, it, expect } from 'vitest';
import { IOError, DecodeErrorStatus, NetworkErrorStatus } from '../error/DecodingError.js';

describe('DecodingError consolidated', () => {
  it('sets DecodeErrorStatus for DecodingError details', () => {
    const err = new IOError('fail', { kind: 'DecodingError', errors: [] });
    expect((err.details as any).status).toBe(DecodeErrorStatus);
    expect(err.message).toBe('fail');
  });

  it('preserves provided status for communication errors', () => {
    const err = new IOError('net', { kind: 'NetworkError', status: NetworkErrorStatus });
    expect((err.details as any).status).toBe(NetworkErrorStatus);
  });

  it('uses KnownError status when provided', () => {
    const err = new IOError('known', { kind: 'KnownError', status: '404', body: { x: 1 } } as any);
    expect((err.details as any).status).toBe('404');
  });

  it('handles ServerError kind', () => {
    const err = new IOError('server', { kind: 'ServerError', status: '500' } as unknown as any);
    expect((err.details as any).status).toBe('500');
    expect(err.status).toBe(500);
  });

  it('falls back to assigning stack when captureStackTrace missing', () => {
    const orig = (Error as any).captureStackTrace;
    try {
      delete (Error as any).captureStackTrace;
      const err = new IOError('nostack', { kind: 'ClientError', status: '400' } as unknown as any);
      expect(err.stack).toBeDefined();
      expect(typeof err.stack).toBe('string');
    } finally {
      (Error as any).captureStackTrace = orig;
    }
  });
});
