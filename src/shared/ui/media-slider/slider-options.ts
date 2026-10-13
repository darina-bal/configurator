/** Длительность прокрутки слайдов, мс: как у слайдера centersvet.ru (его `transform .6s ease-in-out`). */
export const SLIDE_SPEED_MS = 600;

export const PREV_SLIDE_LABEL = 'Предыдущий слайд';
export const NEXT_SLIDE_LABEL = 'Следующий слайд';

/** Русские подписи модуля A11y — общие у обычного слайдера и полноэкранной галереи. */
export const A11Y_MESSAGES = {
  containerRoleDescriptionMessage: 'карусель',
  itemRoleDescriptionMessage: 'слайд',
  prevSlideMessage: PREV_SLIDE_LABEL,
  nextSlideMessage: NEXT_SLIDE_LABEL,
  slideLabelMessage: 'Слайд {{index}} из {{slidesLength}}',
} as const;
