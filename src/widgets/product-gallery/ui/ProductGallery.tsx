import { useEffect, useMemo } from 'react';

import { buildGallerySlides, type Product, type ProductVariant } from '@/entities/product';
import { preloadImages } from '@/shared/lib/preload-image';
import { MediaSlider } from '@/shared/ui/media-slider';

import styles from './ProductGallery.module.scss';

interface ProductGalleryProps {
  product: Product;
  /** Выбранный SKU: в галерее — только его фото, чертёж и общее видео товара. */
  variant: ProductVariant;
}

/**
 * Галерея выбранного SKU. При выборе другой опции слайды остаются теми же, меняется их содержимое,
 * а плавную смену кадра даёт View Transition (см. `useProductConfigurator` и `.root` в стилях).
 * Фото и чертежи остальных SKU подгружаются заранее, чтобы кроссфейд не ждал сеть.
 */
export function ProductGallery({ product, variant }: Readonly<ProductGalleryProps>) {
  const slides = useMemo(() => buildGallerySlides(product, variant), [product, variant]);

  useEffect(() => {
    const urls = product.variants.flatMap((item) => [item.photo.src, item.diagram?.src ?? '']);
    return preloadImages(urls.filter(Boolean));
  }, [product]);

  return (
    <div className={styles.root}>
      <MediaSlider key={product.slug} slides={slides} label={`Галерея: ${product.name}`} />
    </div>
  );
}
