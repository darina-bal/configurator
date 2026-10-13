import { Icon } from '@/shared/ui/icon';

import { useCart } from '../model/use-cart';
import styles from './CartIndicator.module.scss';

/**
 * Значок корзины со счётчиком. Страницы корзины в прототипе нет, поэтому это не ссылка;
 * <output> (неявная роль status) заставляет скринридер озвучить новое количество после добавления товара.
 * Размер значка задаёт родитель CSS-переменной `--cart-icon-size` (по умолчанию 14px).
 */
export function CartIndicator() {
  const { totalQty } = useCart();

  return (
    <output className={styles.root}>
      <Icon name="cart" className={styles.icon} />
      <span className={styles.hidden}>Корзина, товаров:</span>
      <span className={styles.badge}>{totalQty}</span>
    </output>
  );
}
