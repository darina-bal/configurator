interface CartItem {
  sku: string;
  productSlug: string;
  /** Название позиции для списка корзины: «LOOP.RT · Белый». */
  name: string;
  /** Цена за штуку на момент добавления, ₽. */
  price: number;
  qty: number;
}

type AddToCartResult =
  | { ok: true; qty: number }
  | { ok: false; reason: 'out-of-stock' | 'limit-reached' | 'invalid-quantity' };

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export const CART_STORAGE_KEY = 'configurator:cart';

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.sku === 'string' &&
    typeof item.productSlug === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    Number.isInteger(item.qty) &&
    (item.qty as number) > 0
  );
}

function loadItems(storage: StorageLike): readonly CartItem[] {
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    // Повреждённые данные не должны ломать приложение — начинаем с пустой корзины.
    return [];
  }
}

/**
 * Хранилище корзины: внешний стор для `useSyncExternalStore` с сохранением в localStorage.
 * `storage = null` — корзина живёт только в памяти (нет доступа к localStorage).
 */
export function createCartStore(storage: StorageLike | null) {
  let items: readonly CartItem[] = storage ? loadItems(storage) : [];
  const listeners = new Set<() => void>();

  function commit(next: readonly CartItem[]) {
    items = next;
    try {
      storage?.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Квота или приватный режим: корзина продолжает работать до перезагрузки страницы.
    }
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot: (): readonly CartItem[] => items,

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    /** Добавляет `quantity` штук (по умолчанию одну), не превышая остаток `stock` с учётом уже лежащих. */
    add(item: Omit<CartItem, 'qty'>, stock: number, quantity = 1): AddToCartResult {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return { ok: false, reason: 'invalid-quantity' };
      }
      if (stock <= 0) return { ok: false, reason: 'out-of-stock' };

      const existing = items.find((current) => current.sku === item.sku);
      const qty = (existing?.qty ?? 0) + quantity;
      if (qty > stock) return { ok: false, reason: 'limit-reached' };

      commit(
        existing
          ? items.map((current) => (current.sku === item.sku ? { ...current, qty } : current))
          : [...items, { ...item, qty }],
      );
      return { ok: true, qty };
    },

    remove(sku: string) {
      if (items.some((item) => item.sku === sku)) {
        commit(items.filter((item) => item.sku !== sku));
      }
    },

    clear() {
      if (items.length > 0) commit([]);
    },
  };
}

type CartStore = ReturnType<typeof createCartStore>;

export function getTotalQty(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

function getBrowserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const cartStore: CartStore = createCartStore(getBrowserStorage());
