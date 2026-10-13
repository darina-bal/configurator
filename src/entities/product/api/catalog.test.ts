import { describe, expect, it } from 'vitest';

import { findVariant } from '../model/find-variant';
import { getDefaultVariant } from '../model/selection';
import { validateProduct } from '../model/validate-product';
import { getProductBySlug, listProducts } from './catalog';

describe('каталог', () => {
  it('содержит два товара с уникальными slug', () => {
    const slugs = listProducts().map((product) => product.slug);
    expect(slugs).toEqual(['loop_rt_main', 'locus_duo']);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(listProducts().map((product) => [product.slug, product] as const))(
    'данные товара «%s» целостны',
    (_slug, product) => {
      expect(validateProduct(product)).toEqual([]);
    },
  );

  it('находит товар по slug и не находит несуществующий', () => {
    expect(getProductBySlug('locus_duo')?.name).toBe('LOCUS DUO');
    expect(getProductBySlug('unknown')).toBeUndefined();
  });
});

describe('LOOP.RT', () => {
  const product = getProductBySlug('loop_rt_main');

  it('имеет единственную опцию «Цвет» и 4 SKU с одинаковой ценой', () => {
    expect(product?.options.map((option) => option.id)).toEqual(['finish']);
    expect(product?.variants).toHaveLength(4);
    expect(new Set(product?.variants.map((variant) => variant.price))).toEqual(new Set([4800]));
  });

  it('все SKU в наличии, остатки различаются', () => {
    const stocks = product?.variants.map((variant) => variant.stock);
    expect(stocks).toEqual([162, 199, 195, 190]);
  });

  it('угол света зависит от отделки: Medium у краски, Wide у латуни', () => {
    const angle = (finishId: string) =>
      product &&
      findVariant(product, { finish: finishId })?.specs.find((spec) => spec.label === 'Угол света')
        ?.value;

    expect(angle('paint-white')).toBe('Medium');
    expect(angle('patina-brass')).toBe('Wide');
  });
});

describe('LOCUS DUO', () => {
  const product = getProductBySlug('locus_duo');

  it('имеет опции «Трек» и «Цвет» и полную матрицу 2 × 3', () => {
    expect(product?.options.map((option) => option.id)).toEqual(['track', 'finish']);
    expect(product?.variants).toHaveLength(6);
  });

  it('цены зависят от трека, а у накладного — ещё и от цвета', () => {
    const price = (track: string, finish: string) =>
      product && findVariant(product, { track, finish })?.price;

    expect(price('recessed', 'paint-white')).toBe(10800);
    expect(price('recessed', 'patina-satin')).toBe(10800);
    expect(price('surface', 'paint-white')).toBe(18600);
    expect(price('surface', 'patina-satin')).toBe(20800);
  });

  it('патина нет в наличии на обоих треках, остальное — есть', () => {
    const outOfStock = product?.variants.filter((variant) => variant.stock === 0);
    expect(outOfStock?.map((variant) => variant.selection.finish)).toEqual([
      'patina-satin',
      'patina-satin',
    ]);
  });

  it('по умолчанию выбирается первый SKU в наличии: встроенный белый', () => {
    expect(product && getDefaultVariant(product).selection).toEqual({
      track: 'recessed',
      finish: 'paint-white',
    });
  });

  it('блоки описания зависят от трека и повторяют плашки страниц сайта', () => {
    const recessed = product && findVariant(product, { track: 'recessed', finish: 'paint-white' });
    const surface = product && findVariant(product, { track: 'surface', finish: 'paint-white' });

    expect(recessed?.description?.map((block) => block.title)).toEqual([
      'SUPERSLIM (DALI)',
      'ТРЕКИ',
      'SSD.LOCUS',
    ]);
    expect(surface?.description?.map((block) => block.title)).toEqual([
      'SUPERSLIM (DALI)',
      'ТРЕК',
      'SSD.LOCUS',
    ]);
    expect(recessed?.description?.at(-1)?.paragraphs.join(' ')).toContain('встроенного трека');
    expect(surface?.description?.at(-1)?.paragraphs.join(' ')).toContain('накладного трека');
  });

  it('чертёж зависит от трека, но не от цвета', () => {
    const variant = (track: string, finish: string) =>
      product && findVariant(product, { track, finish });

    expect(variant('recessed', 'paint-white')?.diagram).toBeDefined();
    expect(variant('recessed', 'paint-white')?.diagram?.src).toBe(
      variant('recessed', 'paint-black')?.diagram?.src,
    );
    expect(variant('recessed', 'paint-white')?.diagram?.src).not.toBe(
      variant('surface', 'paint-white')?.diagram?.src,
    );
  });
});

describe('блок скачивания', () => {
  it.each(
    listProducts().flatMap((product) =>
      product.variants.map((variant) => [variant.sku, variant] as const),
    ),
  )('«%s»: файлы в порядке и составе сайта — 3D Files, DIALux, паспорт (PDF)', (_sku, variant) => {
    expect(variant.files.map((file) => file.title)).toEqual([
      '3D Files',
      'DIALux',
      'Паспорт, инструкция',
    ]);
    // У этих изделий нет 3D-файлов и файла DIALux — строки приглушены; паспорт есть (PDF).
    expect(variant.files.map((file) => file.available)).toEqual([false, false, true]);
    expect(variant.files[2]?.format).toBe('pdf');
  });
});
