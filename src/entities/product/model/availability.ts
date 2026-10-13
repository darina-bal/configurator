import { findVariant } from './find-variant';
import { applyOption } from './selection';
import type { Product, Selection } from './types';

export interface OptionValueState {
  inStock: boolean;
}

/**
 * Наличие каждого значения опции относительно текущего выбора: есть ли в наличии SKU, который
 * получится при его выборе (при необходимости — ближайший). Порядок тот же, что у `option.values`.
 */
export function getOptionValueStates(
  product: Product,
  selection: Selection,
  optionId: string,
): OptionValueState[] {
  const option = product.options.find((item) => item.id === optionId);
  if (!option) return [];

  return option.values.map((value) => {
    const variant = findVariant(product, applyOption(product, selection, optionId, value.id));
    return { inStock: (variant?.stock ?? 0) > 0 };
  });
}
