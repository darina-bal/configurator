import { describe, expect, it, vi } from 'vitest';

import { CART_STORAGE_KEY, createCartStore, getTotalQty } from './cart-store';

function memoryStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(CART_STORAGE_KEY, initial);
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
  };
}

const white = { sku: 'LOOP-W', productSlug: 'loop_rt_main', name: 'LOOP.RT · Белый', price: 4800 };
const black = { sku: 'LOOP-B', productSlug: 'loop_rt_main', name: 'LOOP.RT · Чёрный', price: 4800 };

describe('cart store: добавление', () => {
  it('начинает с пустой корзины', () => {
    const store = createCartStore(memoryStorage());
    expect(store.getSnapshot()).toEqual([]);
  });

  it('добавляет новую позицию с количеством 1', () => {
    const store = createCartStore(memoryStorage());

    expect(store.add(white, 10)).toEqual({ ok: true, qty: 1 });
    expect(store.getSnapshot()).toEqual([{ ...white, qty: 1 }]);
  });

  it('увеличивает количество при повторном добавлении того же SKU', () => {
    const store = createCartStore(memoryStorage());
    store.add(white, 10);
    store.add(black, 10);

    expect(store.add(white, 10)).toEqual({ ok: true, qty: 2 });
    expect(store.getSnapshot().map((item) => [item.sku, item.qty])).toEqual([
      ['LOOP-W', 2],
      ['LOOP-B', 1],
    ]);
  });

  it('не добавляет товар без остатка', () => {
    const store = createCartStore(memoryStorage());

    expect(store.add(white, 0)).toEqual({ ok: false, reason: 'out-of-stock' });
    expect(store.getSnapshot()).toEqual([]);
  });

  it('не позволяет положить больше остатка', () => {
    const store = createCartStore(memoryStorage());
    store.add(white, 2);
    store.add(white, 2);

    expect(store.add(white, 2)).toEqual({ ok: false, reason: 'limit-reached' });
    expect(store.getSnapshot()[0]?.qty).toBe(2);
  });

  it('добавляет сразу несколько штук', () => {
    const store = createCartStore(memoryStorage());

    expect(store.add(white, 10, 3)).toEqual({ ok: true, qty: 3 });
    expect(store.add(white, 10, 2)).toEqual({ ok: true, qty: 5 });
    expect(store.getSnapshot()).toEqual([{ ...white, qty: 5 }]);
  });

  it('проверяет остаток с учётом количества и уже лежащих в корзине штук', () => {
    const store = createCartStore(memoryStorage());
    store.add(white, 5, 3);

    expect(store.add(white, 5, 3)).toEqual({ ok: false, reason: 'limit-reached' });
    expect(store.add(white, 5, 2)).toEqual({ ok: true, qty: 5 });
    expect(store.getSnapshot()[0]?.qty).toBe(5);
  });

  it.each([0, -1, 1.5, Number.NaN])('не принимает некорректное количество %s', (quantity) => {
    const store = createCartStore(memoryStorage());

    expect(store.add(white, 10, quantity)).toEqual({ ok: false, reason: 'invalid-quantity' });
    expect(store.getSnapshot()).toEqual([]);
  });
});

describe('cart store: удаление', () => {
  it('удаляет позицию по SKU', () => {
    const store = createCartStore(memoryStorage());
    store.add(white, 10);
    store.add(black, 10);

    store.remove('LOOP-W');

    expect(store.getSnapshot().map((item) => item.sku)).toEqual(['LOOP-B']);
  });

  it('очищает корзину', () => {
    const store = createCartStore(memoryStorage());
    store.add(white, 10);

    store.clear();

    expect(store.getSnapshot()).toEqual([]);
  });

  it('не уведомляет подписчиков, если удалять нечего', () => {
    const store = createCartStore(memoryStorage());
    const listener = vi.fn();
    store.subscribe(listener);

    store.remove('unknown');
    store.clear();

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('cart store: подписка', () => {
  it('уведомляет подписчиков об изменениях и меняет ссылку на снимок', () => {
    const store = createCartStore(memoryStorage());
    const listener = vi.fn();
    store.subscribe(listener);
    const before = store.getSnapshot();

    store.add(white, 10);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).not.toBe(before);
  });

  it('возвращает стабильный снимок, пока корзина не менялась', () => {
    const store = createCartStore(memoryStorage());
    store.add(white, 10);

    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('перестаёт уведомлять после отписки', () => {
    const store = createCartStore(memoryStorage());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.add(white, 10);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('cart store: сохранение', () => {
  it('записывает корзину в storage и восстанавливает её в новом сторе', () => {
    const storage = memoryStorage();
    createCartStore(storage).add(white, 10);

    expect(JSON.parse(storage.data.get(CART_STORAGE_KEY) ?? '[]')).toEqual([{ ...white, qty: 1 }]);
    expect(createCartStore(storage).getSnapshot()).toEqual([{ ...white, qty: 1 }]);
  });

  it('игнорирует повреждённый JSON', () => {
    expect(createCartStore(memoryStorage('{не json')).getSnapshot()).toEqual([]);
  });

  it('отбрасывает некорректные позиции, оставляя валидные', () => {
    const raw = JSON.stringify([
      { ...white, qty: 2 },
      { sku: 'broken' },
      { ...black, qty: 0 },
      { ...black, qty: 1.5 },
      'строка',
      null,
    ]);

    expect(createCartStore(memoryStorage(raw)).getSnapshot()).toEqual([{ ...white, qty: 2 }]);
  });

  it('игнорирует данные, которые не являются массивом', () => {
    expect(createCartStore(memoryStorage('{"sku":"x"}')).getSnapshot()).toEqual([]);
  });

  it('продолжает работать, если запись в storage недоступна', () => {
    const storage = memoryStorage();
    storage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const store = createCartStore(storage);

    expect(store.add(white, 10)).toEqual({ ok: true, qty: 1 });
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it('работает в памяти, если storage нет', () => {
    const store = createCartStore(null);

    expect(store.add(white, 10)).toEqual({ ok: true, qty: 1 });
    expect(store.getSnapshot()).toHaveLength(1);
  });
});

describe('getTotalQty', () => {
  it('суммирует количество по всем позициям', () => {
    expect(getTotalQty([])).toBe(0);
    expect(
      getTotalQty([
        { ...white, qty: 2 },
        { ...black, qty: 3 },
      ]),
    ).toBe(5);
  });
});
