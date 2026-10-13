import type { Product } from '../model/types';
import { locusDuo } from './data/locus-duo';
import { loopRt } from './data/loop-rt';

/**
 * Каталог товаров. Сейчас — статические данные; при подключении бэкенда меняется только
 * этот файл (потребители работают через `listProducts` / `getProductBySlug`).
 */
const products: readonly Product[] = [loopRt, locusDuo];

export function listProducts(): readonly Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
