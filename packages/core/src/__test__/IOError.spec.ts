import { describe, it, expect } from 'vitest';
import { IOError, DecodeErrorStatus, NetworkErrorStatus } from '../error/DecodingError.js';

describe('IOError details handling', () => {
  it('handles DecodingError kind', () => {
    const err = new IOError('dec', { kind: 'DecodingError', errors: [] } as any);
    expect((err.details as any).status).toBe(DecodeErrorStatus);
    expect(err.status).toBe(parseInt(DecodeErrorStatus));
  });

  it('handles ClientError kind', () => {
    const err = new IOError('client', {
      kind: 'ClientError',
      status: '400',
      meta: { a: 1 },
    } as unknown as any);
    expect((err.details as any).status).toBe('400');
    expect(err.status).toBe(400);
  });

  it('handles NetworkError kind', () => {
    const err = new IOError('net', {
      kind: 'NetworkError',
      status: NetworkErrorStatus,
    } as unknown as any);
    expect((err.details as any).status).toBe(NetworkErrorStatus);
    expect(err.status).toBe(parseInt(NetworkErrorStatus));
  });

  it('handles KnownError kind', () => {
    const details: any = { kind: 'KnownError', status: 'K123', body: { x: 1 } } as unknown as any;
    const err = new IOError('known', details);
    expect((err.details as any).status).toBe('K123');
    expect(err.status).toBe(parseInt('K123'));
  });
});
