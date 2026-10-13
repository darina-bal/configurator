import clsx from 'clsx';
import { useEffect, useId, useState } from 'react';

import { useCart } from '@/entities/cart';
import { getVariantLabel, type Product, type ProductVariant } from '@/entities/product';
import { Icon } from '@/shared/ui/icon';

import styles from './AddToCart.module.scss';

/** Сколько показывать подтверждение «Добавлено». */
const FEEDBACK_MS = 2500;

type OrderState = 'idle' | 'added' | 'full' | 'out';

/** Название кнопки для скринридеров (на экране у неё только значок). */
const BUTTON_LABEL: Record<OrderState, string> = {
  idle: 'Добавить в корзину',
  added: 'Добавлено',
  full: 'Весь остаток в корзине',
  out: 'Нет в наличии',
};

/** Короткая подпись над кнопкой — как «В избранное» над кнопкой блока цены на сайте. */
const CAPTION: Record<OrderState, string> = {
  idle: 'В корзину',
  added: 'Добавлено',
  full: 'В корзине',
  out: 'В корзину',
};

interface AddToCartProps {
  product: Product;
  variant: ProductVariant;
  /** Положение относительно соседних блоков задаёт родитель. */
  className?: string;
}

/**
 * Количество и кнопка «в корзину» для выбранного SKU — правая часть блока цены centersvet.ru.
 * Количество ограничено остатком с учётом того, что уже лежит в корзине; без остатка элементы
 * отключены; после добавления кнопка на пару секунд подтверждает действие (дублируется
 * скринридеру через role="status"). Для сброса при смене SKU вызывающий код задаёт `key={variant.sku}`.
 *
 * Размеры элементов родитель задаёт CSS-переменными (список — в стилях компонента).
 */
export function AddToCart({ product, variant, className }: Readonly<AddToCartProps>) {
  const { items, add } = useCart();
  const inputId = useId();
  const [quantity, setQuantity] = useState(1);
  // Текст в поле, пока его редактируют; null — поле показывает текущее количество.
  const [draft, setDraft] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [added]);

  const inCart = items.find((item) => item.sku === variant.sku)?.qty ?? 0;
  const remaining = Math.max(variant.stock - inCart, 0);
  const soldOut = variant.stock <= 0;
  // Добавлять нечего: нет остатка или он весь уже в корзине. Поле и «+»/«−» тогда отключаются,
  // а кнопка корзины и кнопки у границы количества остаются в фокусе и лишь помечаются
  // aria-disabled — иначе фокус пропал бы сразу после нажатия на последнюю штуку.
  const blocked = soldOut || remaining === 0;
  const max = Math.max(remaining, 1);
  const clamp = (value: number) => Math.min(Math.max(value, 1), max);
  const current = clamp(quantity);

  let state: OrderState = 'idle';
  if (soldOut) state = 'out';
  else if (added) state = 'added';
  else if (remaining === 0) state = 'full';
  const confirmed = state === 'added' || state === 'full';

  /** Применяет набранный в поле текст и возвращает итоговое количество. */
  function commitDraft(): number {
    if (draft === null) return current;
    const parsed = Number.parseInt(draft, 10);
    const next = Number.isNaN(parsed) ? current : clamp(parsed);
    setQuantity(next);
    setDraft(null);
    return next;
  }

  function step(delta: number) {
    setQuantity(clamp(commitDraft() + delta));
  }

  function handleAdd() {
    if (blocked) return;
    const count = commitDraft();
    const label = getVariantLabel(product, variant);
    const result = add(
      {
        sku: variant.sku,
        productSlug: product.slug,
        name: label ? `${product.name} · ${label}` : product.name,
        price: variant.price,
      },
      variant.stock,
      count,
    );
    if (!result.ok) return;
    setQuantity(1);
    setAdded(true);
  }

  let announcement = '';
  if (added) {
    announcement = 'Товар добавлен в корзину';
    if (remaining === 0) announcement += '. Весь остаток уже в корзине';
  }

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.amount}>
        <label className={styles.caption} htmlFor={inputId}>
          Количество
        </label>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.step}
            aria-label="Уменьшить количество"
            disabled={blocked}
            aria-disabled={current <= 1}
            onClick={() => step(-1)}
          >
            <Icon name="minus" />
          </button>
          <input
            id={inputId}
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            step={1}
            value={draft ?? current}
            disabled={blocked}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              commitDraft();
            }}
          />
          <button
            type="button"
            className={styles.step}
            aria-label="Увеличить количество"
            disabled={blocked}
            aria-disabled={current >= max}
            onClick={() => step(1)}
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>

      <div className={styles.action}>
        <span className={styles.caption} aria-hidden="true">
          {CAPTION[state]}
        </span>
        <button
          type="button"
          className={clsx(styles.cart, state === 'added' && styles.added)}
          aria-label={BUTTON_LABEL[state]}
          disabled={soldOut}
          aria-disabled={blocked}
          onClick={handleAdd}
        >
          <Icon
            name={confirmed ? 'check' : 'cart-button'}
            className={confirmed ? styles.checkIcon : styles.cartIcon}
          />
        </button>
      </div>

      <span className={styles.announcement} role="status">
        {announcement}
      </span>
    </div>
  );
}
