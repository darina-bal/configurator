import type { DescriptionBlock, Product, ProductVariant } from './types';

/** Короткое название SKU по выбранным значениям опций: «Накладной · Белый». */
export function getVariantLabel(product: Product, variant: ProductVariant): string {
  return product.options
    .map(
      (option) => option.values.find((value) => value.id === variant.selection[option.id])?.label,
    )
    .filter((label): label is string => Boolean(label))
    .join(' · ');
}

/** Блоки описания для выбранного SKU: собственные, если заданы, иначе общие блоки товара. */
export function getVariantDescription(
  product: Product,
  variant: ProductVariant,
): DescriptionBlock[] {
  return variant.description ?? product.description;
}
