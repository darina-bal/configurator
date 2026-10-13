import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { cartStore } from '../model/cart-store';
import { CartIndicator } from './CartIndicator';

const item = { sku: 'LOOP-W', productSlug: 'loop_rt_main', name: 'LOOP.RT · Белый', price: 4800 };

describe('CartIndicator', () => {
  beforeEach(() => {
    cartStore.clear();
  });

  it('показывает ноль для пустой корзины', () => {
    render(<CartIndicator />);
    expect(screen.getByRole('status')).toHaveTextContent('Корзина, товаров:0');
  });

  it('обновляет счётчик после добавления товара', () => {
    render(<CartIndicator />);

    act(() => {
      cartStore.add(item, 10);
      cartStore.add(item, 10);
    });

    expect(screen.getByRole('status')).toHaveTextContent('Корзина, товаров:2');
  });
});
