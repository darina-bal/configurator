import { useLoaderData } from 'react-router';

import type { Product } from '@/entities/product';
import { useProductConfigurator } from '@/features/configure-product';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { ProductConfigurator } from '@/widgets/product-configurator';
import { ProductDetails } from '@/widgets/product-details';
import { ProductGallery } from '@/widgets/product-gallery';

import styles from './ProductPage.module.scss';

/**
 * Страница-конфигуратор товара: /product/:slug. Товар приходит из `productLoader` маршрута
 * (неизвестный slug на этом этапе уже превратился в 404).
 */
export function ProductPage() {
  const product = useLoaderData<Product>();
  const { selection, variant, select } = useProductConfigurator(product);
  useDocumentTitle(`${product.name} — конфигуратор — Центрсвет`);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Слева — галерея выбранного SKU (липкая), справа — опции, под ними цена и «в корзину». */}
        <div className={styles.layout}>
          <div className={styles.gallery}>
            <ProductGallery product={product} variant={variant} />
          </div>
          <div className={styles.panel}>
            <ProductConfigurator
              product={product}
              selection={selection}
              variant={variant}
              onSelect={select}
            />
          </div>
        </div>

        <ProductDetails product={product} variant={variant} />
      </div>
    </main>
  );
}
