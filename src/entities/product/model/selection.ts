import type { Product, ProductVariant, Selection } from './types';

/** Сколько опций SKU совпадает с желаемым выбором (опцию `skipOptionId` не считаем). */
function countMatches(
  product: Product,
  variant: ProductVariant,
  wanted: Selection,
  skipOptionId?: string,
): number {
  return product.options.filter(
    (option) => option.id !== skipOptionId && variant.selection[option.id] === wanted[option.id],
  ).length;
}

/**
 * Лучший SKU из списка: больше всего совпадений, а при равенстве — тот, что в наличии.
 * При полном равенстве выигрывает первый в списке.
 */
function pickBest(
  variants: readonly ProductVariant[],
  matches: (variant: ProductVariant) => number,
): ProductVariant | undefined {
  let best: ProductVariant | undefined;
  let bestScore = -1;

  for (const variant of variants) {
    // Совпадения весят больше наличия: «в наличии» лишь разрешает ничью.
    const score = matches(variant) * 2 + (variant.stock > 0 ? 1 : 0);
    if (score > bestScore) {
      best = variant;
      bestScore = score;
    }
  }

  return best;
}

/** SKU по умолчанию: первый, что есть в наличии, иначе просто первый. */
export function getDefaultVariant(product: Product): ProductVariant {
  const variant = product.variants.find((item) => item.stock > 0) ?? product.variants[0];
  if (!variant) {
    throw new Error(`У товара «${product.slug}» нет ни одного варианта`);
  }
  return variant;
}

export function getDefaultSelection(product: Product): Selection {
  return getDefaultVariant(product).selection;
}

/**
 * Меняет значение одной опции. Если комбинации с остальными текущими значениями не существует,
 * подбирает ближайший реальный SKU — выбор всегда указывает на существующую позицию.
 */
export function applyOption(
  product: Product,
  current: Selection,
  optionId: string,
  valueId: string,
): Selection {
  const candidates = product.variants.filter((variant) => variant.selection[optionId] === valueId);
  const best = pickBest(candidates, (variant) => countMatches(product, variant, current, optionId));
  return best?.selection ?? current;
}

/**
 * Разбирает выбор из параметров URL. Неизвестные значения игнорируются, неполный выбор
 * достраивается до ближайшего SKU, пустой — даёт SKU по умолчанию.
 */
export function parseSelection(product: Product, params: URLSearchParams): Selection {
  const requested: Record<string, string> = {};

  for (const option of product.options) {
    const valueId = params.get(option.id);
    if (valueId !== null && option.values.some((value) => value.id === valueId)) {
      requested[option.id] = valueId;
    }
  }

  if (Object.keys(requested).length === 0) {
    return getDefaultSelection(product);
  }

  const best = pickBest(product.variants, (variant) => countMatches(product, variant, requested));
  return (best ?? getDefaultVariant(product)).selection;
}

/** Выбор в виде пар «опция → значение» для параметров URL. */
export function serializeSelection(selection: Selection): Record<string, string> {
  return { ...selection };
}
