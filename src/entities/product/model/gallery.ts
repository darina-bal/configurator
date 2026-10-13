import type { Product, ProductVariant } from './types';
import { getVariantLabel } from './variant-info';

/** Слайд галереи товара (структурно совпадает со слайдом UI-слайдера). */
interface GallerySlide {
  /** Слот слайда: «photo», «diagram» или id общего слайда (`extraMedia`). Не зависит от SKU. */
  id: string;
  kind: 'image' | 'video' | 'embed';
  src: string;
  alt: string;
  label: string;
  poster?: string;
  fit?: 'cover' | 'contain';
}

/**
 * Галерея выбранного SKU: его фото, чертёж и общие слайды товара (видео).
 * Id слайдов — слоты, а не SKU: при смене выбора слайды остаются теми же, меняется только их
 * содержимое, поэтому слайдер не пересоздаётся и сохраняет, на каком слайде находится пользователь.
 * Постер видео — фото выбранного SKU.
 */
export function buildGallerySlides(product: Product, variant: ProductVariant): GallerySlide[] {
  const slides: GallerySlide[] = [
    {
      id: 'photo',
      kind: 'image',
      src: variant.photo.src,
      alt: variant.photo.alt,
      label: getVariantLabel(product, variant) || 'Фото',
    },
  ];

  if (variant.diagram) {
    slides.push({
      id: 'diagram',
      kind: 'image',
      src: variant.diagram.src,
      alt: variant.diagram.alt,
      label: 'Чертёж',
      fit: 'contain',
    });
  }

  for (const media of product.extraMedia ?? []) {
    slides.push(
      media.kind === 'image'
        ? { ...media }
        : { ...media, poster: media.poster ?? variant.photo.src },
    );
  }

  return slides;
}
