import clsx from 'clsx';

import { EmbedPlayer } from './EmbedPlayer';
import styles from './SlideMedia.module.scss';
import type { MediaSlide } from './types';

interface SlideMediaProps {
  slide: MediaSlide;
  /**
   * Слайд сейчас на экране. Плеер стороннего сервиса при уходе со слайда возвращается к постеру:
   * iframe не должен играть в фоне.
   */
  active: boolean;
  /** Вписывать любое изображение целиком (в полноэкранной галерее); иначе — как задано у слайда. */
  containAll?: boolean;
}

/** Содержимое одного слайда — изображение, видеофайл или плеер стороннего сервиса. */
export function SlideMedia({ slide, active, containAll = false }: Readonly<SlideMediaProps>) {
  if (slide.kind === 'video') {
    return (
      <video
        className={styles.media}
        src={slide.src}
        poster={slide.poster}
        aria-label={slide.alt}
        controls
        muted
        playsInline
        preload="none"
      />
    );
  }

  if (slide.kind === 'embed') {
    return (
      <EmbedPlayer
        key={active ? 'active' : 'idle'}
        src={slide.src}
        title={slide.alt}
        poster={slide.poster}
      />
    );
  }

  const isDiagram = slide.fit === 'contain';

  return (
    <img
      className={clsx(
        styles.media,
        (isDiagram || containAll) && styles.contain,
        isDiagram && styles.multiply,
      )}
      src={slide.src}
      alt={slide.alt}
      referrerPolicy="no-referrer"
      decoding="async"
      draggable={false}
    />
  );
}
