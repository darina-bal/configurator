import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { A11y, Keyboard, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';

import 'swiper/css';
import 'swiper/css/a11y';

import { Icon } from '../icon';
import styles from './MediaLightbox.module.scss';
import {
  A11Y_MESSAGES,
  NEXT_SLIDE_LABEL,
  PREV_SLIDE_LABEL,
  SLIDE_SPEED_MS,
} from './slider-options';
import { SlideMedia } from './SlideMedia';
import type { MediaSlide } from './types';

interface MediaLightboxProps {
  slides: MediaSlide[];
  /** Слайд, на котором открывается галерея. */
  initialIndex: number;
  /** Название галереи: из него складывается подпись диалога. */
  label: string;
  reducedMotion: boolean;
  /** Галерея закрыта крестиком или клавишей Esc; `index` — слайд, на котором остановились. */
  onClose: (index: number) => void;
}

/**
 * Нажатие мышью не переносит фокус на стрелку: иначе клавиши ←/→ после клика подсвечивали бы её
 * рамкой фокуса. Клик при этом срабатывает, а с клавиатуры стрелки доступны через Tab.
 */
function keepFocus(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

/**
 * Полноэкранная галерея по образцу centersvet.ru: чёрный диалог на весь экран, кадр по центру,
 * крестик, счётчик «1 / N» и стрелки; листается стрелками, клавишами ←/→ и свайпом, с зацикливанием.
 * Это второй экземпляр Swiper на те же слайды. Модальность (фокус внутри, Esc, возврат фокуса,
 * неактивная страница под диалогом) даёт нативный `<dialog>`; по фону и кадру галерея не закрывается.
 */
export function MediaLightbox({
  slides,
  initialIndex,
  label,
  reducedMotion,
  onClose,
}: Readonly<MediaLightboxProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const onCloseRef = useRef(onClose);
  const [opened, setOpened] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Диалог открываем раньше, чем появится Swiper: в закрытом диалоге у слайдера нулевые размеры.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onCloseRef.current(swiperRef.current?.realIndex ?? initialIndex);
    dialog.addEventListener('close', handleClose);
    // Повторный вызов безопасен: в StrictMode React запускает эффект дважды.
    if (!dialog.open) dialog.showModal();
    // showModal() отдаёт фокус первому элементу — крестику, и клавиши ←/→ подсвечивали бы его рамкой
    // фокуса (браузер показывает её на сфокусированном элементе после нажатия клавиши). Поэтому
    // фокус держим на самом диалоге: Tab по-прежнему ведёт к крестику и стрелкам.
    dialog.focus({ preventScroll: true });
    setOpened(true);

    // Закрывать диалог в очистке нельзя: событие close пришло бы уже после повторной подписки (в
    // StrictMode) и закрыло галерею. Убранный из DOM диалог браузер сам снимает с верхнего слоя.
    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [initialIndex]);

  function handleSlideChange(swiper: SwiperInstance) {
    // Уходя со слайда, останавливаем видео.
    swiper.el.querySelectorAll('video').forEach((video) => video.pause());
    setActiveIndex(swiper.realIndex);
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      tabIndex={-1}
      aria-label={`${label} — на весь экран`}
    >
      <button
        type="button"
        className={styles.close}
        aria-label="Закрыть"
        onClick={() => dialogRef.current?.close()}
      >
        <Icon name="close" size={20} />
      </button>

      {opened && (
        <>
          <Swiper
            className={styles.frame}
            modules={[A11y, Keyboard, Navigation]}
            loop={slides.length > 1}
            initialSlide={initialIndex}
            speed={reducedMotion ? 0 : SLIDE_SPEED_MS}
            simulateTouch={false}
            keyboard={{ enabled: true, onlyInViewport: false }}
            navigation={{ prevEl: `.${styles.arrowPrev}`, nextEl: `.${styles.arrowNext}` }}
            noSwipingSelector="video"
            focusableElements="input, select, option, textarea, video, label"
            a11y={A11Y_MESSAGES}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={handleSlideChange}
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={slide.id} className={styles.slide}>
                <SlideMedia slide={slide} active={index === activeIndex} containAll />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* До 1280px стрелки стоят по бокам счётчика под кадром, от 1280px — у краёв экрана. */}
          <div className={styles.controls}>
            <button
              type="button"
              className={clsx(styles.arrow, styles.arrowPrev)}
              aria-label={PREV_SLIDE_LABEL}
              onMouseDown={keepFocus}
            >
              <Icon name="arrow-long" size={13} className={styles.long} />
              <Icon name="chevron" size={24} className={styles.short} />
            </button>
            <output className={styles.counter}>
              {activeIndex + 1} / {slides.length}
            </output>
            <button
              type="button"
              className={clsx(styles.arrow, styles.arrowNext)}
              aria-label={NEXT_SLIDE_LABEL}
              onMouseDown={keepFocus}
            >
              <Icon name="arrow-long" size={13} className={styles.long} />
              <Icon name="chevron" size={24} className={styles.short} />
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
