import type { Product, ProductVariant } from './types';

/**
 * Компактный товар для тестов модели (не входит в Public API слайса).
 * Матрица намеренно неполная: нет сочетания «накладной × золото» — так проверяется подбор
 * ближайшего SKU. Часть SKU без остатка.
 */
function variant(
  sku: string,
  track: 'recessed' | 'surface',
  finish: 'white' | 'black' | 'gold',
  price: number,
  stock: number,
): ProductVariant {
  return {
    sku,
    selection: { track, finish },
    price,
    stock,
    warranty: 2,
    photo: { src: `https://cdn.test/${sku}.jpg`, alt: sku },
    specs: [{ label: 'Артикул', value: sku }],
    files: [{ title: 'Паспорт, инструкция', format: 'pdf', kind: 'document', available: true }],
  };
}

export const testProduct: Product = {
  slug: 'test-light',
  name: 'Тестовый светильник',
  description: [{ title: 'Общий блок', paragraphs: ['Общее описание товара'] }],
  options: [
    {
      id: 'track',
      label: 'Трек',
      kind: 'card',
      values: [
        { id: 'recessed', label: 'Встроенный' },
        { id: 'surface', label: 'Накладной' },
      ],
    },
    {
      id: 'finish',
      label: 'Цвет',
      kind: 'swatch',
      values: [
        { id: 'white', label: 'Белый', swatch: '#fff' },
        { id: 'black', label: 'Чёрный', swatch: '#000' },
        { id: 'gold', label: 'Золото', swatch: '#c2a468' },
      ],
    },
  ],
  variants: [
    variant('R-W', 'recessed', 'white', 1000, 5),
    variant('R-B', 'recessed', 'black', 1000, 0),
    variant('R-G', 'recessed', 'gold', 1200, 7),
    variant('S-W', 'surface', 'white', 1800, 3),
    variant('S-B', 'surface', 'black', 1800, 12),
  ],
  extraMedia: [
    { id: 'video', kind: 'video', src: 'https://cdn.test/promo.mp4', label: 'Видео', alt: 'Видео' },
  ],
};
