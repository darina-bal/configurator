export { getProductBySlug, listProducts } from './api/catalog';
export { getOptionValueStates, type OptionValueState } from './model/availability';
export { findVariant } from './model/find-variant';
export { buildGallerySlides } from './model/gallery';
export {
  applyOption,
  getDefaultVariant,
  parseSelection,
  serializeSelection,
} from './model/selection';
export type {
  DescriptionBlock,
  Product,
  ProductFile,
  ProductOption,
  ProductVariant,
  Selection,
  SpecItem,
} from './model/types';
export { getVariantDescription, getVariantLabel } from './model/variant-info';
export { PriceTag } from './ui/PriceTag';
export { ProductCard } from './ui/ProductCard';
export { StockStatus } from './ui/StockStatus';
