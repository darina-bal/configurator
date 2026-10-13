import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCart } from '@/entities/cart';
import { getProductBySlug, type ProductVariant } from '@/entities/product';

import { AddToCart } from './AddToCart';

const product = getProductBySlug('locus_duo');
const inStock = product?.variants.find((variant) => variant.stock > 0);
const outOfStock = product?.variants.find((variant) => variant.stock === 0);
if (!product || !inStock || !outOfStock) throw new Error('Нет данных LOCUS DUO');

// Стрелочные функции, а не declarations: TS сохраняет сужение `product` только для них.
const renderControls = (variant: ProductVariant) =>
  render(<AddToCart product={product} variant={variant} />);

/** Содержимое корзины на данный момент (стор общий для всех деревьев React). */
const readCart = () => renderHook(() => useCart()).result.current.items;

/** Кладёт в корзину `qty` штук SKU заранее — как будто пользователь уже добавлял его. */
const preloadCart = (variant: ProductVariant, qty: number) => {
  const { result } = renderHook(() => useCart());
  act(() => {
    result.current.add(
      { sku: variant.sku, productSlug: 'locus_duo', name: 'LOCUS DUO', price: variant.price },
      variant.stock,
      qty,
    );
  });
};

const addButton = () => screen.getByRole('button', { name: 'Добавить в корзину' });
const plus = () => screen.getByRole('button', { name: 'Увеличить количество' });
const minus = () => screen.getByRole('button', { name: 'Уменьшить количество' });
const field = () => screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Количество' });

describe('AddToCart', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.clear());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('по умолчанию добавляет одну штуку с названием, ценой и подтверждением', async () => {
    renderControls(inStock);
    expect(field()).toHaveValue(1);

    await userEvent.click(addButton());

    expect(readCart()).toEqual([
      {
        sku: inStock.sku,
        productSlug: 'locus_duo',
        name: 'LOCUS DUO · Встроенный · Белый',
        price: 10800,
        qty: 1,
      },
    ]);
    expect(screen.getByRole('button', { name: 'Добавлено' })).toBeInTheDocument();
    expect(screen.getByText('Добавлено')).toBeInTheDocument(); // подпись над кнопкой
    expect(screen.getByRole('status')).toHaveTextContent('Товар добавлен в корзину');
  });

  it('через пару секунд возвращает исходное состояние', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderControls(inStock);

    await user.click(addButton());
    expect(screen.getByRole('button', { name: 'Добавлено' })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(addButton()).toBeInTheDocument();
    expect(screen.getByText('В корзину')).toBeInTheDocument();
  });

  describe('количество', () => {
    it('кнопки «+» и «−» меняют его в пределах от одной штуки до остатка', async () => {
      renderControls({ ...inStock, stock: 3 });

      await userEvent.click(plus());
      await userEvent.click(plus());
      expect(field()).toHaveValue(3);
      expect(plus()).toHaveAttribute('aria-disabled', 'true');

      await userEvent.click(plus());
      expect(field()).toHaveValue(3);

      await userEvent.click(minus());
      await userEvent.click(minus());
      expect(field()).toHaveValue(1);
      expect(minus()).toHaveAttribute('aria-disabled', 'true');

      await userEvent.click(minus());
      expect(field()).toHaveValue(1);
    });

    it('принимает число, набранное в поле, и после выхода из поля ограничивает его остатком', async () => {
      renderControls({ ...inStock, stock: 5 });

      await userEvent.clear(field());
      await userEvent.type(field(), '3');
      await userEvent.tab();
      expect(field()).toHaveValue(3);

      await userEvent.clear(field());
      await userEvent.type(field(), '9');
      await userEvent.tab();
      expect(field()).toHaveValue(5);

      await userEvent.clear(field());
      await userEvent.type(field(), '0');
      await userEvent.tab();
      expect(field()).toHaveValue(1);
    });

    it('если поле очистили, возвращает прежнее количество', async () => {
      renderControls({ ...inStock, stock: 5 });
      await userEvent.click(plus());

      await userEvent.clear(field());
      await userEvent.tab();

      expect(field()).toHaveValue(2);
    });

    it('применяет набранное число по Enter', async () => {
      renderControls({ ...inStock, stock: 5 });

      await userEvent.clear(field());
      await userEvent.type(field(), '4{Enter}');

      expect(field()).toHaveValue(4);
    });

    it('добавляет выбранное количество сразу и возвращает поле к одной штуке', async () => {
      renderControls({ ...inStock, stock: 10 });

      await userEvent.clear(field());
      await userEvent.type(field(), '4');
      await userEvent.click(addButton());

      expect(readCart()[0]?.qty).toBe(4);
      expect(field()).toHaveValue(1);
    });

    it('учитывает то, что уже лежит в корзине: сверх остатка не добавить', async () => {
      preloadCart(inStock, 3);
      renderControls({ ...inStock, stock: 5 });

      await userEvent.click(plus());
      await userEvent.click(plus());
      expect(field()).toHaveValue(2); // осталось 5 − 3 = 2
      expect(plus()).toHaveAttribute('aria-disabled', 'true');

      await userEvent.click(addButton());

      expect(readCart()[0]?.qty).toBe(5);
    });
  });

  it('когда весь остаток в корзине, кнопка помечается недоступной и ничего не добавляет', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderControls({ ...inStock, stock: 2 });

    await user.clear(field());
    await user.type(field(), '2');
    await user.click(addButton());
    expect(screen.getByRole('status')).toHaveTextContent('Весь остаток уже в корзине');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const button = screen.getByRole('button', { name: 'Весь остаток в корзине' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled(); // не disabled: фокус не должен пропасть после нажатия
    expect(screen.getByText('В корзине')).toBeInTheDocument();

    await user.click(button);

    expect(readCart()[0]?.qty).toBe(2);
  });

  it('для SKU без остатка всё отключено и ничего не добавляется', async () => {
    renderControls(outOfStock);

    const button = screen.getByRole('button', { name: 'Нет в наличии' });
    expect(button).toBeDisabled();
    expect(field()).toBeDisabled();
    expect(plus()).toBeDisabled();
    expect(minus()).toBeDisabled();

    await userEvent.click(button);
    expect(readCart()).toEqual([]);
  });

  it('применяет className родителя к корню', () => {
    const { container } = render(
      <AddToCart product={product} variant={inStock} className="from-parent" />,
    );

    expect(container.firstElementChild).toHaveClass('from-parent');
  });
});
