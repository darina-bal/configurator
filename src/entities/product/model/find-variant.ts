import type { Product, ProductVariant, Selection } from './types';

/** Находит SKU, у которого значения всех опций товара совпадают с выбором. */
export function findVariant(product: Product, selection: Selection): ProductVariant | undefined {
  return product.variants.find((variant) =>
    product.options.every((option) => variant.selection[option.id] === selection[option.id]),
  );
}
