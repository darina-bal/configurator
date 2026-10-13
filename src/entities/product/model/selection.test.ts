import { describe, expect, it } from 'vitest';

import { findVariant } from './find-variant';
import {
  applyOption,
  getDefaultSelection,
  getDefaultVariant,
  parseSelection,
  serializeSelection,
} from './selection';
import { testProduct } from './test-product';
import type { Product } from './types';

describe('getDefaultVariant / getDefaultSelection', () => {
  it('берёт первый SKU, который есть в наличии', () => {
    expect(getDefaultVariant(testProduct).sku).toBe('R-W');
    expect(getDefaultSelection(testProduct)).toEqual({ track: 'recessed', finish: 'white' });
  });

  it('пропускает SKU без остатка', () => {
    const product: Product = {
      ...testProduct,
      variants: testProduct.variants.map((variant, index) =>
        index === 0 ? { ...variant, stock: 0 } : variant,
      ),
    };
    // R-W закончился, R-B тоже без остатка → первый в наличии — R-G
    expect(getDefaultVariant(product).sku).toBe('R-G');
  });

  it('если ничего нет в наличии, возвращает первый SKU', () => {
    const product: Product = {
      ...testProduct,
      variants: testProduct.variants.map((variant) => ({ ...variant, stock: 0 })),
    };
    expect(getDefaultVariant(product).sku).toBe('R-W');
  });

  it('бросает понятную ошибку, если у товара нет SKU', () => {
    expect(() => getDefaultVariant({ ...testProduct, variants: [] })).toThrow(/нет ни одного/);
  });
});

describe('applyOption', () => {
  const current = { track: 'recessed', finish: 'white' };

  it('меняет значение, сохраняя остальные опции, если такая комбинация есть', () => {
    expect(applyOption(testProduct, current, 'track', 'surface')).toEqual({
      track: 'surface',
      finish: 'white',
    });
    expect(applyOption(testProduct, current, 'finish', 'black')).toEqual({
      track: 'recessed',
      finish: 'black',
    });
  });

  it('подбирает ближайший существующий SKU, когда точной комбинации нет', () => {
    // «накладной × золото» не существует: остаётся накладной, цвет — первый доступный в наличии
    const result = applyOption(
      testProduct,
      { track: 'recessed', finish: 'gold' },
      'track',
      'surface',
    );
    expect(result.track).toBe('surface');
    expect(findVariant(testProduct, result)).toBeDefined();
  });

  it('при равенстве совпадений предпочитает SKU в наличии', () => {
    const product: Product = {
      ...testProduct,
      variants: testProduct.variants.map((variant) =>
        variant.sku === 'S-W' ? { ...variant, stock: 0 } : variant,
      ),
    };
    // из накладных S-W закончился → выбирается S-B, хотя S-W стоит раньше
    const result = applyOption(product, { track: 'recessed', finish: 'gold' }, 'track', 'surface');
    expect(result).toEqual({ track: 'surface', finish: 'black' });
  });

  it('возвращает текущий выбор, если значение не существует', () => {
    expect(applyOption(testProduct, current, 'track', 'ceiling')).toBe(current);
  });
});

describe('parseSelection', () => {
  const parse = (query: string) => parseSelection(testProduct, new URLSearchParams(query));

  it('пустой URL → SKU по умолчанию', () => {
    expect(parse('')).toEqual({ track: 'recessed', finish: 'white' });
  });

  it('точная комбинация из URL', () => {
    expect(parse('track=surface&finish=black')).toEqual({ track: 'surface', finish: 'black' });
  });

  it('достраивает неполный выбор до существующего SKU', () => {
    expect(parse('finish=gold')).toEqual({ track: 'recessed', finish: 'gold' });
    expect(parse('track=surface').track).toBe('surface');
  });

  it('игнорирует неизвестные значения и параметры', () => {
    expect(parse('track=ceiling&finish=pink&utm=1')).toEqual({
      track: 'recessed',
      finish: 'white',
    });
    expect(parse('track=surface&finish=pink').track).toBe('surface');
  });

  it('несуществующая комбинация превращается в существующий SKU', () => {
    const result = parse('track=surface&finish=gold');
    expect(findVariant(testProduct, result)).toBeDefined();
  });
});

describe('serializeSelection', () => {
  it('возвращает копию выбора в виде простого объекта', () => {
    const selection = { track: 'surface', finish: 'black' };
    const serialized = serializeSelection(selection);
    expect(serialized).toEqual(selection);
    expect(serialized).not.toBe(selection);
  });
});
