import type { LoaderFunctionArgs, ShouldRevalidateFunction } from 'react-router';

import { getProductBySlug, type Product } from '@/entities/product';

/**
 * Loader маршрута /product/:slug. Неизвестный slug — это 404 на уровне маршрута
 * (его показывает errorElement), а не ошибка рендера страницы.
 */
export function productLoader({ params }: LoaderFunctionArgs): Product {
  const product = getProductBySlug(params.slug ?? '');

  if (!product) {
    throw new Response('Товар не найден', { status: 404 });
  }

  return product;
}

/**
 * Товар зависит только от slug. Выбор опций меняет лишь параметры запроса (?track=…&finish=…),
 * и это не должно перезапускать loader (а с настоящим API — повторно грузить товар).
 */
export const shouldRevalidateProduct: ShouldRevalidateFunction = ({ currentParams, nextParams }) =>
  currentParams.slug !== nextParams.slug;
