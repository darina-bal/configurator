import type { ReactNode, SVGProps } from 'react';

interface IconDefinition {
  viewBox: string;
  /** Атрибуты рисования по умолчанию: у каждой иконки свой стиль (контур или заливка). */
  paint: SVGProps<SVGSVGElement>;
  body: ReactNode;
}

const STROKE_24: SVGProps<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const STROKE_23: SVGProps<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round',
};

// cube, checkbox и download повторяют значки блока скачивания на centersvet.ru,
// minus, plus и cart-button — значки блока цены (степпер количества и кнопка корзины),
// cart, search, globe, user, burger и close — значки шапки сайта (close — ещё и крестик
// полноэкранной галереи), chevron и arrow-long — стрелки слайдера сайта: шеврон из его панели
// управления, длинная стрелка из полноэкранной галереи. Обе смотрят вправо, влево их разворачивают.
const icons = {
  // Корзина шапки сайта: контур тележки и два колеса-точки (как svg «Избранное» на сайте).
  cart: {
    viewBox: '0 0 262.98 269.15',
    paint: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 26,
      strokeLinecap: 'round',
      strokeMiterlimit: 10,
    },
    body: (
      <>
        <path d="M5,5h20.86c4.92,0,8.91,3.99,8.91,8.91v156.86c0,4.92,3.99,8.91,8.91,8.91h169.81c3.92,0,7.38-2.56,8.52-6.31l35.57-116.45c1.75-5.73-2.54-11.52-8.52-11.52H87.94" />
        <circle cx="46.87" cy="245.61" r="23.54" fill="currentColor" stroke="none" />
        <circle cx="207.33" cy="245.61" r="23.54" fill="currentColor" stroke="none" />
      </>
    ),
  },
  search: {
    viewBox: '0 0 24 24',
    paint: { ...STROKE_24, strokeWidth: 2 },
    body: (
      <>
        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" />
        <path d="M21 21L16.65 16.65" />
      </>
    ),
  },
  globe: {
    viewBox: '0 0 14 14',
    paint: { fill: 'none', stroke: 'currentColor' },
    body: (
      <>
        <circle cx="7" cy="7" r="6.5" />
        <path d="M7 0.5C7.24513 0.5 7.52037 0.614082 7.81641 0.90625C8.11457 1.20054 8.40657 1.65081 8.66211 2.24707C9.17248 3.43793 9.5 5.1181 9.5 7C9.5 8.8819 9.17248 10.5621 8.66211 11.7529C8.40657 12.3492 8.11457 12.7995 7.81641 13.0938C7.52037 13.3859 7.24513 13.5 7 13.5C6.75487 13.5 6.47963 13.3859 6.18359 13.0938C5.88543 12.7995 5.59343 12.3492 5.33789 11.7529C4.82752 10.5621 4.5 8.8819 4.5 7C4.5 5.1181 4.82752 3.43793 5.33789 2.24707C5.59343 1.6508 5.88543 1.20054 6.18359 0.90625C6.47963 0.614082 6.75487 0.5 7 0.5Z" />
        <path d="M1.5 4H13" />
        <path d="M1.5 10H13" />
        <path d="M1 7H13.5" />
      </>
    ),
  },
  user: {
    viewBox: '0 0 14 13',
    paint: { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeMiterlimit: 10 },
    body: (
      <path d="M0.599609 12.6016C0.599609 9.4631 3.30929 7.0631 6.59961 7.0631C9.88993 7.0631 12.5996 9.64771 12.5996 12.6016M9.89039 3.74003C9.89039 5.47335 8.41726 6.87849 6.60007 6.87849C4.78287 6.87849 3.30975 5.47335 3.30975 3.74003C3.30975 2.0067 4.78287 0.601562 6.60007 0.601562C8.41726 0.601562 9.89039 2.0067 9.89039 3.74003Z" />
    ),
  },
  // Две линии разной длины — кнопка меню на узких экранах.
  burger: {
    viewBox: '0 0 27 20',
    paint: { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round' },
    body: <path d="M0.5 5.57H26.5M0.5 14.43H17.66" />,
  },
  close: {
    viewBox: '0 0 11 11',
    paint: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.3,
      strokeLinecap: 'round',
      strokeMiterlimit: 10,
    },
    body: <path d="M0.4375 0.4375L10.5 10.5M10.5 0.4375L0.4375 10.5" />,
  },
  chevron: {
    viewBox: '0 0 24 24',
    paint: { ...STROKE_24, strokeWidth: 1 },
    body: <path d="M10 7.4L14.6 12L10 16.6" />,
  },
  'arrow-long': {
    viewBox: '0 0 40 13',
    paint: { fill: 'currentColor' },
    body: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M38.0576 6.96249L32.5202 12.2967L33.2503 13L39.9997 6.49828L39.2696 5.79497L39.2675 5.79691L33.2498 0L32.5197 0.703307L37.9848 5.96786L0 6V6.99463L38.0576 6.96249Z"
      />
    ),
  },
  check: {
    viewBox: '0 0 24 24',
    paint: STROKE_24,
    body: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  },
  play: {
    viewBox: '0 0 24 24',
    paint: { fill: 'currentColor' },
    body: <path d="M8 5v14l11-7z" />,
  },
  minus: {
    viewBox: '0 0 23 24',
    paint: STROKE_23,
    body: <path d="M7 12.1936H15" />,
  },
  plus: {
    viewBox: '0 0 23 24',
    paint: STROKE_23,
    body: (
      <>
        <path d="M8 12.1936H16" />
        <path d="M12 15.6774L12 7.83866" />
      </>
    ),
  },
  // Корзина с полями вокруг (как svg кнопки на сайте): тянется на всю кнопку, см. cart-button.
  'cart-button': {
    viewBox: '0 0 56 44',
    paint: { fill: 'none', stroke: 'currentColor', strokeMiterlimit: 10, strokeLinecap: 'round' },
    body: (
      <>
        <path d="M16.1267 10H18.0662C18.6742 10 19.1606 10.4903 19.1606 11.0895V24.9871C19.1606 25.5924 19.6531 26.0766 20.255 26.0766H35.3756C35.862 26.0766 36.2876 25.7558 36.4274 25.2958L39.4734 15.0239C39.6802 14.3218 39.1512 13.6257 38.4216 13.6257H24.5595" />
        <circle cx="22.2089" cy="31.4808" r="0.5" fill="currentColor" strokeWidth="2" />
        <circle cx="33.2089" cy="31.4808" r="0.5" fill="currentColor" strokeWidth="2" />
      </>
    ),
  },
  cube: {
    viewBox: '0 0 17 17',
    paint: { fill: 'currentColor' },
    body: (
      <path d="M8.5655 17H8.42605L0.192764 13.2942C0.0659883 13.2371 0 13.1426 0 13.008V3.95308C0 3.85241 0.0770405 3.75437 0.168384 3.71164L7.99794 0.0467886C8.09741 0.000257299 8.22451 -0.0196426 8.3282 0.0251328L16.8072 3.70052C16.934 3.75554 17 3.8527 17 3.98644V13.008C17 13.1429 16.934 13.2371 16.8072 13.2942L8.5655 17ZM8.50081 7.33289L15.9699 3.9683L8.19135 0.593751L1.00446 3.95806L8.50049 7.33289H8.50081ZM8.17997 16.2552L8.18615 7.82337L0.631279 4.42366L0.628353 12.8578L8.17997 16.2552ZM16.3729 12.8567L16.3674 4.42425L8.81385 7.82279L8.8171 16.257L16.3729 12.8567Z" />
    ),
  },
  checkbox: {
    viewBox: '0 0 14 14',
    paint: { fill: 'currentColor' },
    body: (
      <>
        <path d="M3.98002 6.54986C3.81096 6.35684 3.83892 6.1079 4.01109 5.96369C4.18325 5.81947 4.42642 5.84787 4.5835 6.02759L6.25815 7.9423L10.2043 4.2065C10.3689 4.05031 10.6027 4.06007 10.7505 4.19674C10.8983 4.33341 10.9422 4.60498 10.7678 4.77049L6.52661 8.78628C6.3429 8.96022 6.0882 8.95889 5.92091 8.76764L3.98002 6.54942V6.54986Z" />
        <rect
          x="0.35"
          y="0.35"
          width="13.3"
          height="13.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
        />
      </>
    ),
  },
  download: {
    viewBox: '0 0 15 17',
    paint: { fill: 'none', stroke: 'currentColor', strokeWidth: 0.967, strokeLinecap: 'round' },
    body: (
      <>
        <path d="M3.48349 8.48352L6.73608 12.1427C7.13387 12.5902 7.83311 12.5902 8.2309 12.1427L11.4835 8.48352" />
        <path d="M0.48349 12.4835V14.4835C0.48349 15.5881 1.37892 16.4835 2.48349 16.4835H12.4835C13.5881 16.4835 14.4835 15.5881 14.4835 14.4835V12.4835" />
        <path d="M7.48349 12.4835L7.48349 0.483521" />
      </>
    ),
  },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof icons;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Высота иконки, px; ширина считается по пропорциям её viewBox. */
  size?: number;
}

/** Декоративная иконка (скрыта от скринридеров): смысл всегда дублируется текстом рядом. */
export function Icon({ name, size = 24, ...rest }: Readonly<IconProps>) {
  const { viewBox, paint, body } = icons[name];
  const [, , viewWidth = 1, viewHeight = 1] = viewBox.split(' ').map(Number);

  return (
    <svg
      width={(size * viewWidth) / viewHeight}
      height={size}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      {...paint}
      {...rest}
    >
      {body}
    </svg>
  );
}
