import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { preloadImages } from './preload-image';

/** Подмена Image: jsdom не грузит картинки, нам важно лишь, какие адреса запрошены. */
let requested: string[];

beforeEach(() => {
  requested = [];
  vi.useFakeTimers();
  vi.stubGlobal(
    'Image',
    class {
      referrerPolicy = '';
      decoding = '';
      set src(value: string) {
        requested.push(value);
      }
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
});

describe('preloadImages (без requestIdleCallback)', () => {
  it('запрашивает все адреса после небольшой паузы, а не сразу', () => {
    preloadImages(['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg']);
    expect(requested).toEqual([]);

    vi.advanceTimersByTime(300);

    expect(requested).toEqual(['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg']);
  });

  it('не запрашивает один адрес дважды', () => {
    preloadImages(['https://cdn.test/a.jpg', 'https://cdn.test/a.jpg']);

    vi.advanceTimersByTime(300);

    expect(requested).toEqual(['https://cdn.test/a.jpg']);
  });

  it('отмена до запуска ничего не запрашивает', () => {
    const cancel = preloadImages(['https://cdn.test/a.jpg']);

    cancel();
    vi.advanceTimersByTime(300);

    expect(requested).toEqual([]);
  });
});

describe('preloadImages (с requestIdleCallback)', () => {
  it('использует простой браузера и поддерживает отмену', () => {
    const callbacks: (() => void)[] = [];
    const cancelIdle = vi.fn();
    vi.stubGlobal('requestIdleCallback', (callback: () => void) => callbacks.push(callback));
    vi.stubGlobal('cancelIdleCallback', cancelIdle);

    const cancel = preloadImages(['https://cdn.test/a.jpg']);
    expect(requested).toEqual([]);

    callbacks[0]?.();
    expect(requested).toEqual(['https://cdn.test/a.jpg']);

    cancel();
    expect(cancelIdle).toHaveBeenCalledTimes(1);
  });
});
