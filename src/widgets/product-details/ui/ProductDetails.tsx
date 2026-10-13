import { getVariantDescription, type Product, type ProductVariant } from '@/entities/product';

import { DescriptionBlocks } from './DescriptionBlocks';
import { FilesList } from './FilesList';
import styles from './ProductDetails.module.scss';
import { SpecsTable } from './SpecsTable';

interface ProductDetailsProps {
  product: Product;
  variant: ProductVariant;
}

/**
 * Блоки под конфигуратором по образцу страницы товара centersvet.ru: плашки описания, под ними —
 * таблица характеристик слева и блок скачивания (паспорт и инструкция) справа от неё; на узких
 * экранах они идут друг под другом. Всё берётся из выбранного SKU. Фото и чертёж здесь не
 * повторяются — они есть только в галерее.
 */
export function ProductDetails({ product, variant }: Readonly<ProductDetailsProps>) {
  return (
    <div className={styles.root}>
      <DescriptionBlocks blocks={getVariantDescription(product, variant)} />

      <div className={styles.item}>
        <SpecsTable specs={variant.specs} />
        <FilesList files={variant.files} />
      </div>
    </div>
  );
}
