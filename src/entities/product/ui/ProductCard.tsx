import { Link } from 'react-router';

import { ROUTES } from '@/shared/config';

import { getDefaultVariant } from '../model/selection';
import type { Product } from '../model/types';
import { PriceTag } from './PriceTag';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
}

/** Карточка товара в каталоге: фото, название, краткое описание и цена «от». */
export function ProductCard({ product }: Readonly<ProductCardProps>) {
  const photo = getDefaultVariant(product).photo;
  const prices = product.variants.map((variant) => variant.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <Link to={ROUTES.product(product.slug)} className={styles.root}>
      <span className={styles.media}>
        <img
          className={styles.image}
          src={photo.src}
          alt={photo.alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.description}>{product.description[0]?.paragraphs[0]}</span>
        <span className={styles.price}>
          <PriceTag value={minPrice} from={minPrice !== maxPrice} />
        </span>
      </span>
    </Link>
  );
}
