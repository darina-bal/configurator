import { useSyncExternalStore } from 'react';

import { cartStore, getTotalQty } from './cart-store';

/** Состояние корзины и действия над ней. Компонент перерисовывается при любом изменении. */
export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot);

  return {
    items,
    totalQty: getTotalQty(items),
    add: cartStore.add,
    remove: cartStore.remove,
    clear: cartStore.clear,
  };
}
