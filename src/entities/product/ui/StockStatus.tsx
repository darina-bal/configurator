import { formatStock, getStockLevel } from '../model/stock';
import styles from './StockStatus.module.scss';

interface StockStatusProps {
  stock: number;
}

/**
 * Остаток на складе в виде блока цены centersvet.ru: цветная точка (есть / мало / нет) и обычный
 * текст. Размер текста наследуется от родителя, размер точки задаёт он же (см. стили).
 */
export function StockStatus({ stock }: Readonly<StockStatusProps>) {
  return (
    <span className={styles.root} data-level={getStockLevel(stock)}>
      <span className={styles.dot} aria-hidden="true" />
      {formatStock(stock)}
    </span>
  );
}
