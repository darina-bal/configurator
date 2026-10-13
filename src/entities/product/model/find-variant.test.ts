import { describe, expect, it } from 'vitest';

import { findVariant } from './find-variant';
import { testProduct } from './test-product';

describe('findVariant', () => {
  it('находит SKU по полному выбору', () => {
    expect(findVariant(testProduct, { track: 'surface', finish: 'black' })?.sku).toBe('S-B');
    expect(findVariant(testProduct, { track: 'recessed', finish: 'gold' })?.sku).toBe('R-G');
  });

  it('возвращает undefined для несуществующей комбинации', () => {
    expect(findVariant(testProduct, { track: 'surface', finish: 'gold' })).toBeUndefined();
  });

  it('возвращает undefined, если выбор неполный или значение неизвестно', () => {
    expect(findVariant(testProduct, { track: 'surface' })).toBeUndefined();
    expect(findVariant(testProduct, { track: 'ceiling', finish: 'white' })).toBeUndefined();
  });
});
