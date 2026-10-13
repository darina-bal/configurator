import { describe, expect, it } from 'vitest';

import { testProduct } from './test-product';
import type { ProductVariant } from './types';
import { getVariantDescription, getVariantLabel } from './variant-info';

const [first, , , surfaceWhite] = testProduct.variants;

if (!first || !surfaceWhite) throw new Error('В тестовом товаре не хватает SKU');

describe('getVariantLabel', () => {
  it('собирает название из значений опций в порядке опций', () => {
    expect(getVariantLabel(testProduct, first)).toBe('Встроенный · Белый');
    expect(getVariantLabel(testProduct, surfaceWhite)).toBe('Накладной · Белый');
  });

  it('пропускает опции, значение которых не найдено', () => {
    const broken: ProductVariant = { ...first, selection: { track: 'recessed', finish: 'pink' } };
    expect(getVariantLabel(testProduct, broken)).toBe('Встроенный');
  });
});

describe('getVariantDescription', () => {
  it('возвращает общие блоки описания товара по умолчанию', () => {
    expect(getVariantDescription(testProduct, first)).toEqual([
      { title: 'Общий блок', paragraphs: ['Общее описание товара'] },
    ]);
  });

  it('предпочитает блоки описания конкретного SKU', () => {
    const blocks = [{ title: 'Свой блок', paragraphs: ['Только для этого SKU'] }];
    const own: ProductVariant = { ...first, description: blocks };
    expect(getVariantDescription(testProduct, own)).toBe(blocks);
  });
});
