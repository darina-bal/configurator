import { useState } from 'react';

import { Icon } from '../icon';
import styles from './EmbedPlayer.module.scss';

interface EmbedPlayerProps {
  /** Адрес плеера для iframe. */
  src: string;
  /** Название видео: заголовок iframe и подпись кнопки. */
  title: string;
  poster?: string;
}

/**
 * Видео стороннего сервиса (например, Kinescope) без лишней загрузки: пока пользователь не нажал
 * «смотреть», показывается постер, и тяжёлый плеер не подключается. Сброс к постеру при уходе
 * со слайда делает вызывающий код сменой `key`.
 */
export function EmbedPlayer({ src, title, poster }: Readonly<EmbedPlayerProps>) {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <iframe
        className={styles.frame}
        src={src}
        title={title}
        // Полный экран разрешает сам `allow`; атрибут allowfullscreen дублировал бы его (предупреждение в консоли).
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
        referrerPolicy="origin"
      />
    );
  }

  return (
    <button
      type="button"
      className={styles.poster}
      onClick={() => setStarted(true)}
      aria-label={`Смотреть видео: ${title}`}
    >
      {poster && (
        <img
          className={styles.image}
          src={poster}
          alt=""
          referrerPolicy="no-referrer"
          decoding="async"
          draggable={false}
        />
      )}
      <span className={styles.play}>
        <Icon name="play" size={28} />
      </span>
    </button>
  );
}
