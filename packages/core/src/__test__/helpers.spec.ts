import { describe, it, expect } from 'vitest';
import { addSlash } from '../helpers.js';

describe('helpers', () => {
  it('addSlash keeps leading slash', () => {
    expect(addSlash('/x')).toBe('/x');
  });

  it('addSlash prepends slash when missing', () => {
    expect(addSlash('y')).toBe('/y');
  });
});
