import { describe, expect, it } from 'vitest';

import { testProduct } from './test-product';
import type { Product, ProductVariant } from './types';
import { validateProduct } from './validate-product';

function withVariants(mapper: (variants: ProductVariant[]) => ProductVariant[]): Product {
  return { ...testProduct, variants: mapper([...testProduct.variants]) };
}

function first(product: Product): ProductVariant {
  const variant = product.variants[0];
  if (!variant) throw new Error('В товаре нет SKU');
  return variant;
}

describe('validateProduct', () => {
  it('корректный товар не даёт ошибок (в том числе с неполной матрицей)', () => {
    expect(validateProduct(testProduct)).toEqual([]);
  });

  it('ловит дубли SKU', () => {
    const product = withVariants((variants) => [...variants, { ...first(testProduct) }]);
    const errors = validateProduct(product);
    expect(errors.some((error) => error.includes('дублируется SKU «R-W»'))).toBe(true);
    expect(errors.some((error) => error.includes('одной комбинацией'))).toBe(true);
  });

  it('ловит неизвестное значение опции и пропущенную опцию', () => {
    const unknown = withVariants((variants) => [
      { ...first(testProduct), selection: { track: 'ceiling', finish: 'white' } },
      ...variants.slice(1),
    ]);
    expect(
      validateProduct(unknown).some((error) => error.includes('неизвестное значение «ceiling»')),
    ).toBe(true);

    const missing = withVariants((variants) => [
      { ...first(testProduct), selection: { track: 'recessed' } },
      ...variants.slice(1),
    ]);
    expect(
      validateProduct(missing).some((error) => error.includes('не задано значение опции «finish»')),
    ).toBe(true);
  });

  it('проверяет цену, остаток и гарантию', () => {
    const base = first(testProduct);
    const cases: [Partial<ProductVariant>, string][] = [
      [{ price: 0 }, 'цена'],
      [{ price: 99.5 }, 'цена'],
      [{ stock: -1 }, 'остаток'],
      [{ stock: 1.5 }, 'остаток'],
      [{ warranty: -2 }, 'гарантия'],
    ];

    for (const [patch, field] of cases) {
      const product = withVariants((variants) => [{ ...base, ...patch }, ...variants.slice(1)]);
      expect(validateProduct(product).some((error) => error.includes(field))).toBe(true);
    }
  });

  it('проверяет URL фото, чертежа и слайдов', () => {
    const base = first(testProduct);
    const badPhoto = withVariants((variants) => [
      { ...base, photo: { src: 'cdn.test/no-scheme.jpg', alt: 'x' } },
      ...variants.slice(1),
    ]);
    expect(validateProduct(badPhoto).some((error) => error.includes('URL фото'))).toBe(true);

    const badDiagram = withVariants((variants) => [
      { ...base, diagram: { src: 'schema.svg', alt: 'Чертёж' } },
      ...variants.slice(1),
    ]);
    expect(validateProduct(badDiagram).some((error) => error.includes('URL чертежа'))).toBe(true);

    const badMedia: Product = {
      ...testProduct,
      extraMedia: [{ id: 'video', kind: 'video', src: 'promo.mp4', label: 'В', alt: 'В' }],
    };
    expect(validateProduct(badMedia).some((error) => error.includes('URL слайда'))).toBe(true);
  });

  it('требует цвет у значений-свотчей', () => {
    const product: Product = {
      ...testProduct,
      options: testProduct.options.map((option) =>
        option.id === 'finish'
          ? { ...option, values: option.values.map((value) => ({ ...value, swatch: undefined })) }
          : option,
      ),
    };
    expect(validateProduct(product).some((error) => error.includes('нет цвета swatch'))).toBe(true);
  });

  it('находит значение опции, которое не используется ни одним SKU', () => {
    const product: Product = {
      ...testProduct,
      options: testProduct.options.map((option) =>
        option.id === 'finish'
          ? {
              ...option,
              values: [...option.values, { id: 'pink', label: 'Розовый', swatch: '#f9c' }],
            }
          : option,
      ),
    };
    expect(
      validateProduct(product).some((error) => error.includes('«finish/pink» не используется')),
    ).toBe(true);
  });

  it('требует уникальные id общих слайдов', () => {
    const product: Product = {
      ...testProduct,
      extraMedia: [
        { id: 'video', kind: 'video', src: 'https://cdn.test/v.mp4', label: 'В', alt: 'В' },
        { id: 'video', kind: 'embed', src: 'https://player.test/e', label: 'В', alt: 'В' },
      ],
    };
    expect(validateProduct(product).some((error) => error.includes('не уникален'))).toBe(true);
  });

  it('не даёт общим слайдам занять слоты «photo» и «diagram» выбранного SKU', () => {
    for (const id of ['photo', 'diagram']) {
      const product: Product = {
        ...testProduct,
        extraMedia: [{ id, kind: 'video', src: 'https://cdn.test/v.mp4', label: 'В', alt: 'В' }],
      };
      expect(
        validateProduct(product).some((error) => error.includes(`«${id}» зарезервирован`)),
      ).toBe(true);
    }
  });

  it('проверяет блоки описания: заголовок и непустые абзацы', () => {
    const noTitle: Product = {
      ...testProduct,
      description: [{ title: ' ', paragraphs: ['Текст'] }],
    };
    expect(validateProduct(noTitle).some((error) => error.includes('нет заголовка'))).toBe(true);

    const noText: Product = {
      ...testProduct,
      description: [{ title: 'Заголовок', paragraphs: ['Текст', ''] }],
    };
    expect(validateProduct(noText).some((error) => error.includes('пустой абзац'))).toBe(true);

    const variantBlock = withVariants((variants) => [
      { ...first(testProduct), description: [{ title: 'Блок SKU', paragraphs: [] }] },
      ...variants.slice(1),
    ]);
    expect(validateProduct(variantBlock).some((error) => error.includes('нет текста'))).toBe(true);
  });

  it('проверяет slug, название и наличие описания', () => {
    expect(
      validateProduct({ ...testProduct, slug: 'Bad Slug' }).some((error) => error.includes('slug')),
    ).toBe(true);
    expect(
      validateProduct({ ...testProduct, name: '  ' }).some((error) => error.includes('название')),
    ).toBe(true);
    expect(
      validateProduct({ ...testProduct, description: [] }).some((error) =>
        error.includes('описания'),
      ),
    ).toBe(true);
  });

  it('сообщает об отсутствии опций и SKU', () => {
    const errors = validateProduct({ ...testProduct, options: [], variants: [] });
    expect(errors.some((error) => error.includes('нет ни одной опции'))).toBe(true);
    expect(errors.some((error) => error.includes('нет ни одного SKU'))).toBe(true);
  });
});
