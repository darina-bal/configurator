import { describe, expect, it } from 'vitest';

import { buildGallerySlides } from './gallery';
import { testProduct } from './test-product';
import type { Product, ProductVariant } from './types';

const [recessedWhite, , , surfaceWhite] = testProduct.variants;

if (!recessedWhite || !surfaceWhite) throw new Error('В тестовом товаре не хватает SKU');

const withDiagram = (variant: ProductVariant): ProductVariant => ({
  ...variant,
  diagram: { src: `https://cdn.test/${variant.sku}.svg`, alt: `Чертёж ${variant.sku}` },
});

describe('buildGallerySlides', () => {
  it('содержит только слайды выбранного SKU: его фото и общее видео', () => {
    const slides = buildGallerySlides(testProduct, recessedWhite);

    expect(slides.map((slide) => slide.id)).toEqual(['photo', 'video']);
    expect(slides[0]).toMatchObject({
      kind: 'image',
      src: 'https://cdn.test/R-W.jpg',
      alt: 'R-W',
      label: 'Встроенный · Белый',
    });
  });

  it('не включает фото других SKU', () => {
    const slides = buildGallerySlides(testProduct, recessedWhite);
    const sources = slides.map((slide) => slide.src);

    expect(sources.some((src) => src.includes('R-B') || src.includes('S-W'))).toBe(false);
  });

  it('фото и чертёж меняются вместе с SKU, а слоты слайдов остаются теми же', () => {
    const first = buildGallerySlides(testProduct, withDiagram(recessedWhite));
    const second = buildGallerySlides(testProduct, withDiagram(surfaceWhite));

    expect(first.map((slide) => slide.id)).toEqual(['photo', 'diagram', 'video']);
    expect(second.map((slide) => slide.id)).toEqual(['photo', 'diagram', 'video']);
    expect(first[0]?.src).toBe('https://cdn.test/R-W.jpg');
    expect(second[0]?.src).toBe('https://cdn.test/S-W.jpg');
    expect(first[1]?.src).toBe('https://cdn.test/R-W.svg');
    expect(second[1]?.src).toBe('https://cdn.test/S-W.svg');
  });

  it('чертёж вписывается в кадр целиком (fit: contain) и подписан «Чертёж»', () => {
    const [, diagram] = buildGallerySlides(testProduct, withDiagram(recessedWhite));

    expect(diagram).toMatchObject({ kind: 'image', fit: 'contain', label: 'Чертёж' });
  });

  it('без чертежа у SKU слайда с чертежом нет', () => {
    const slides = buildGallerySlides(testProduct, recessedWhite);

    expect(slides.some((slide) => slide.id === 'diagram')).toBe(false);
  });

  it('использует фото выбранного SKU как постер видео', () => {
    const video = (variant: ProductVariant) =>
      buildGallerySlides(testProduct, variant).find((slide) => slide.kind === 'video');

    expect(video(recessedWhite)?.poster).toBe('https://cdn.test/R-W.jpg');
    expect(video(surfaceWhite)?.poster).toBe('https://cdn.test/S-W.jpg');
  });

  it('не перезаписывает собственный постер, поддерживает встроенный плеер и общие изображения', () => {
    const product: Product = {
      ...testProduct,
      extraMedia: [
        {
          id: 'video',
          kind: 'embed',
          src: 'https://player.test/embed/1',
          poster: 'https://cdn.test/own.jpg',
          label: 'Видео',
          alt: 'Видео',
        },
        {
          id: 'plan',
          kind: 'image',
          src: 'https://cdn.test/plan.svg',
          label: 'План',
          alt: 'План',
          fit: 'contain',
        },
      ],
    };
    const slides = buildGallerySlides(product, recessedWhite);

    expect(slides.find((slide) => slide.id === 'video')).toMatchObject({
      kind: 'embed',
      poster: 'https://cdn.test/own.jpg',
    });
    expect(slides.find((slide) => slide.id === 'plan')?.fit).toBe('contain');
  });

  it('работает для товара без дополнительных слайдов', () => {
    const slides = buildGallerySlides({ ...testProduct, extraMedia: undefined }, recessedWhite);

    expect(slides.map((slide) => slide.id)).toEqual(['photo']);
  });
});
