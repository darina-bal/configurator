import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { A11y, FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';

import 'swiper/css';
import 'swiper/css/a11y';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';

import { prefersReducedMotion } from '@/shared/lib/prefers-reduced-motion';

import { Icon } from '../icon';
import { MediaLightbox } from './MediaLightbox';
import styles from './MediaSlider.module.scss';
import {
  A11Y_MESSAGES,
  NEXT_SLIDE_LABEL,
  PREV_SLIDE_LABEL,
  SLIDE_SPEED_MS,
} from './slider-options';
import { SlideMedia } from './SlideMedia';
import type { MediaSlide } from './types';

interface MediaSliderProps {
  slides: MediaSlide[];
  /** Доступное название галереи. */
  label: string;
}

/** Высота стрелки в зоне перелистывания, px. */
const ZONE_ARROW_SIZE = 40;

/**
 * Галерея на Swiper по образцу слайдера centersvet.ru: горизонтальная прокрутка с зацикливанием,
 * перелистывание кликом по краям кадра (зоны по 30% ширины, со стрелкой при наведении) и свайпом,
 * по клику на кадр картинки — полноэкранная галерея; под кадром — миниатюры. Своей логики слайдера
 * здесь нет. Набор слайдов можно менять на лету (смена конфигурации товара): слайды с прежним `id`
 * остаются на месте, а миниатюры показывают ровно текущий набор.
 */
export function MediaSlider({ slides, label }: Readonly<MediaSliderProps>) {
  const [main, setMain] = useState<SwiperInstance | null>(null);
  const [thumbs, setThumbs] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reducedMotion] = useState(prefersReducedMotion);

  // Подписка через on/off: Swiper React не обновляет обработчики событий при перерисовке.
  useEffect(() => {
    if (!main) return;

    const handleSlideChange = () => {
      // Уходя со слайда, останавливаем видео.
      main.el.querySelectorAll('video').forEach((video) => video.pause());
      // В режиме loop индекс слайда в DOM смещён: для сравнения со списком нужен настоящий.
      setActiveIndex(main.realIndex);
    };

    main.on('slideChange', handleSlideChange);
    return () => {
      main.off('slideChange', handleSlideChange);
    };
  }, [main]);

  function handleLightboxClose(index: number) {
    setLightboxIndex(null);
    // Обычный слайдер встаёт на тот кадр, на котором остановились в полноэкранной галерее.
    main?.slideToLoop(index, 0);
  }

  return (
    <div className={styles.root}>
      <Swiper
        className={styles.main}
        modules={[A11y, Navigation, Thumbs]}
        loop={slides.length > 1}
        speed={reducedMotion ? 0 : SLIDE_SPEED_MS}
        // Как на сайте, мышью слайды не таскают: у краёв кадра зоны-кнопки, у центра — открытие галереи.
        simulateTouch={false}
        navigation={{ prevEl: `.${styles.prev}`, nextEl: `.${styles.next}` }}
        // Свайп не должен перехватывать управление видео (перемотка, громкость). Кнопки (постер
        // плеера, «открыть на весь экран») в этот список не входят: по ним можно листать, а клик
        // по-прежнему срабатывает.
        noSwipingSelector="video"
        focusableElements="input, select, option, textarea, video, label"
        thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
        a11y={{ containerRole: 'region', containerMessage: label, ...A11Y_MESSAGES }}
        onSwiper={setMain}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className={styles.slide}>
            {slide.kind === 'image' ? (
              <button
                type="button"
                className={styles.expand}
                aria-label={`Открыть на весь экран: ${slide.alt}`}
                onClick={() => setLightboxIndex(index)}
              >
                <SlideMedia slide={slide} active={index === activeIndex} />
              </button>
            ) : (
              <SlideMedia slide={slide} active={index === activeIndex} />
            )}
          </SwiperSlide>
        ))}
        <button
          type="button"
          className={clsx(styles.zone, styles.prev)}
          aria-label={PREV_SLIDE_LABEL}
        >
          <Icon name="chevron" size={ZONE_ARROW_SIZE} />
        </button>
        <button
          type="button"
          className={clsx(styles.zone, styles.next)}
          aria-label={NEXT_SLIDE_LABEL}
        >
          <Icon name="chevron" size={ZONE_ARROW_SIZE} />
        </button>
      </Swiper>

      {/* Миниатюры дублируют навигацию (кнопки-зоны основного слайдера доступны с клавиатуры). */}
      <Swiper
        className={styles.thumbs}
        modules={[FreeMode, Thumbs]}
        aria-hidden="true"
        watchSlidesProgress
        freeMode
        slidesPerView="auto"
        spaceBetween={8}
        onSwiper={setThumbs}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className={styles.thumb} title={slide.label}>
            {(slide.kind === 'image' || slide.poster) && (
              <img
                className={clsx(styles.thumbImage, slide.fit === 'contain' && styles.contain)}
                src={slide.kind === 'image' ? slide.src : slide.poster}
                alt=""
                referrerPolicy="no-referrer"
                decoding="async"
                draggable={false}
              />
            )}
            {slide.kind !== 'image' && (
              <span className={styles.play}>
                <Icon name="play" size={20} />
              </span>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {lightboxIndex !== null && (
        <MediaLightbox
          slides={slides}
          initialIndex={lightboxIndex}
          label={label}
          reducedMotion={reducedMotion}
          onClose={handleLightboxClose}
        />
      )}
    </div>
  );
}
