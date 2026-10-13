/** Пауза перед предзагрузкой в браузерах без requestIdleCallback (Safari). */
const FALLBACK_DELAY_MS = 200;

/**
 * Запрашивает изображения заранее, когда браузер свободен, — чтобы смена фото при выборе опции
 * не ждала сеть. Возвращает функцию отмены (например, при размонтировании компонента).
 */
export function preloadImages(urls: readonly string[]): () => void {
  const unique = [...new Set(urls)];
  let cancelled = false;

  const run = () => {
    for (const url of unique) {
      if (cancelled) return;
      const image = new Image();
      image.referrerPolicy = 'no-referrer';
      image.decoding = 'async';
      image.src = url;
    }
  };

  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run);
    return () => {
      cancelled = true;
      window.cancelIdleCallback(handle);
    };
  }

  const timer = window.setTimeout(run, FALLBACK_DELAY_MS);
  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}
