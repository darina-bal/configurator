/** Выбор пользователя: по одному значению на каждую опцию товара («id опции → id значения»). */
export type Selection = Readonly<Record<string, string>>;

export interface OptionValue {
  /** Идентификатор значения опции, например «recessed» или «paint-white». */
  id: string;
  /** Название для покупателя: «Белый». */
  label: string;
  /** Оригинальное название с сайта: «PAINT WHITE». */
  code?: string;
  /** Пояснение под названием в карточке (для kind="card"). */
  hint?: string;
  /** CSS-цвет кружка (для kind="swatch"). */
  swatch?: string;
}

export interface ProductOption {
  /** Идентификатор опции конфигуратора, например «track» или «finish»: параметр в адресе страницы. */
  id: string;
  /** Заголовок шага: «Трек», «Цвет». */
  label: string;
  /** Пояснение к шагу. */
  description?: string;
  /** Как показывать значения: карточки или цветные кружки. */
  kind: 'card' | 'swatch';
  values: OptionValue[];
}

export interface ProductPhoto {
  src: string;
  alt: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

/** Плашка описания: заголовок и абзацы — так же, как блоки описания на centersvet.ru. */
export interface DescriptionBlock {
  /** Заголовок плашки: «LOOP.RT», «SUPERSLIM (DALI)», «ТРЕКИ». */
  title: string;
  paragraphs: string[];
}

export interface ProductFile {
  title: string;
  /** Расширение для подписи, без точки: «pdf», «rar». */
  format: string;
  /** Значок слева от названия: куб для 3D-моделей, галочка в рамке для остальных документов. */
  kind: '3d' | 'document';
  /**
   * Файл у изделия есть; если нет — строка показывается приглушённой, как на сайте. Адреса у файла
   * нет: ссылок на сайт в прототипе нет, строка с файлом — ссылка-заглушка.
   */
  available: boolean;
}

/** Конкретная позиция (SKU) — одна комбинация значений опций. */
export interface ProductVariant {
  sku: string;
  selection: Selection;
  /** Цена, ₽. */
  price: number;
  /** Остаток на складе, шт. */
  stock: number;
  /** Гарантия, лет. */
  warranty: number;
  photo: ProductPhoto;
  /** Чертёж размеров (SVG): слайд галереи сразу после фото SKU. */
  diagram?: ProductPhoto;
  specs: SpecItem[];
  files: ProductFile[];
  /** Заменяет блоки описания товара для этого SKU (например, они зависят от типа трека). */
  description?: DescriptionBlock[];
}

/**
 * Дополнительные слайды галереи, общие для всех SKU товара; идут после фото и чертежа выбранного
 * SKU. `id` — уникальный в пределах товара и не «photo»/«diagram» (так названы слайды SKU).
 * Видео бывает двух видов: файл (`video`, тег <video>) и плеер стороннего сервиса (`embed`, iframe).
 */
export type ExtraMedia =
  | { id: string; kind: 'video'; src: string; poster?: string; label: string; alt: string }
  | { id: string; kind: 'embed'; src: string; poster?: string; label: string; alt: string }
  | {
      id: string;
      kind: 'image';
      src: string;
      label: string;
      alt: string;
      fit?: 'cover' | 'contain';
    };

export interface Product {
  /** Адрес в URL: /product/:slug. Совпадает со slug на centersvet.ru, где такая страница есть. */
  slug: string;
  name: string;
  /** Блоки описания товара; у SKU могут быть свои (`ProductVariant.description`). */
  description: DescriptionBlock[];
  options: ProductOption[];
  variants: ProductVariant[];
  extraMedia?: ExtraMedia[];
}
