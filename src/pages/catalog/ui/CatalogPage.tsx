import { listProducts, ProductCard } from '@/entities/product';
import { useDocumentTitle } from '@/shared/lib/use-document-title';

import styles from './CatalogPage.module.scss';

/** Главная: список товаров с конфигураторами. */
export function CatalogPage() {
  useDocumentTitle('Конфигуратор светильников — Центрсвет');
  const products = listProducts();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Конфигуратор светильников</h1>
          <p className={styles.lead}>
            Выберите светильник и соберите конфигурацию: цена, наличие, характеристики и файлы
            обновляются сразу.
          </p>
        </div>

        <ul className={styles.grid}>
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
