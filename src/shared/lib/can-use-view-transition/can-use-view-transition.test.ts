import { afterEach, describe, expect, it, vi } from 'vitest';

import { canUseViewTransition } from './can-use-view-transition';

type DocumentWithTransitions = { startViewTransition?: () => void };
const doc = document as unknown as DocumentWithTransitions;

const stubReducedMotion = (matches: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches, media: query }));

afterEach(() => {
  delete doc.startViewTransition;
});

describe('canUseViewTransition', () => {
  it('false, если браузер не поддерживает View Transitions', () => {
    stubReducedMotion(false);
    delete doc.startViewTransition;

    expect(canUseViewTransition()).toBe(false);
  });

  it('true при поддержке и обычных настройках движения', () => {
    stubReducedMotion(false);
    doc.startViewTransition = vi.fn();

    expect(canUseViewTransition()).toBe(true);
  });

  it('false, если пользователь просил уменьшить движение', () => {
    stubReducedMotion(true);
    doc.startViewTransition = vi.fn();

    expect(canUseViewTransition()).toBe(false);
  });
});
