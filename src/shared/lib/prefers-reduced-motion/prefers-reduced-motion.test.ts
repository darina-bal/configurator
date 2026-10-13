import { describe, expect, it, vi } from 'vitest';

import { prefersReducedMotion } from './prefers-reduced-motion';

const stubMatchMedia = (matches: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches, media: query }));

describe('prefersReducedMotion', () => {
  it('true, когда включено «уменьшить движение»', () => {
    stubMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it('false по умолчанию', () => {
    stubMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('спрашивает именно про prefers-reduced-motion', () => {
    const matchMedia = vi.fn(() => ({ matches: false }));
    vi.stubGlobal('matchMedia', matchMedia);

    prefersReducedMotion();

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});
