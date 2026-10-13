import {
  PriceTag,
  StockStatus,
  type Product,
  type ProductVariant,
  type Selection,
} from '@/entities/product';
import { AddToCart } from '@/features/add-to-cart';
import { OptionPicker } from '@/features/configure-product';

import styles from './ProductConfigurator.module.scss';

interface ProductConfiguratorProps {
  product: Product;
  selection: Selection;
  variant: ProductVariant;
  onSelect: (optionId: string, valueId: string) => void;
}

/**
 * Правая колонка страницы: название, шаги выбора опций и — под ними — блок цены выбранного SKU
 * в оформлении блока цены centersvet.ru: серая плашка с ценой и наличием слева, количеством и
 * кнопкой корзины справа. Артикул и гарантия выбранного SKU — в таблице характеристик ниже.
 */
export function ProductConfigurator({
  product,
  selection,
  variant,
  onSelect,
}: Readonly<ProductConfiguratorProps>) {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{product.name}</h1>

      <div className={styles.steps}>
        {product.options.map((option) => (
          <OptionPicker
            key={option.id}
            product={product}
            option={option}
            selection={selection}
            onSelect={onSelect}
          />
        ))}
      </div>

      <section className={styles.summary} aria-label="Стоимость и наличие">
        <div className={styles.plate}>
          {/* Цена и наличие меняются при выборе опций — озвучиваем изменения скринридеру. */}
          <div className={styles.price} aria-live="polite" aria-atomic="true">
            <p className={styles.priceTitle}>Цена с НДС 22%</p>
            <p className={styles.priceValue}>
              <PriceTag value={variant.price} />
            </p>
            <StockStatus stock={variant.stock} />
          </div>
          <span className={styles.divider} aria-hidden="true" />
          <AddToCart
            key={variant.sku}
            className={styles.order}
            product={product}
            variant={variant}
          />
        </div>
      </section>
    </div>
  );
}
