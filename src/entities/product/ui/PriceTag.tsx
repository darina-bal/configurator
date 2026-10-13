import { formatPrice } from '@/shared/lib/format-price';

import styles from './PriceTag.module.scss';

interface PriceTagProps {
  value: number;
  /** Показать приставку «от» (минимальная цена среди вариантов). */
  from?: boolean;
}

export function PriceTag({ value, from = false }: Readonly<PriceTagProps>) {
  return (
    <span className={styles.root}>
      {from && <span className={styles.prefix}>от </span>}
      {formatPrice(value)}
    </span>
  );
}
