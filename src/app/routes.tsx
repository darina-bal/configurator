import type { RouteObject } from 'react-router';

import { CatalogPage } from '@/pages/catalog';
import { NotFoundPage } from '@/pages/not-found';
import { ProductPage, productLoader, shouldRevalidateProduct } from '@/pages/product';
import { ROUTES } from '@/shared/config';
import { SiteHeader } from '@/widgets/site-header';

import { Layout } from './Layout';

/**
 * Маршруты приложения. Неизвестный slug товара `productLoader` превращает в ответ 404 —
 * его ловит errorElement и показывает ту же страницу «не найдено», что и неизвестный адрес.
 */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    // Показывается, пока выполняются loader'ы первого экрана: шапка появляется сразу.
    hydrateFallbackElement: <SiteHeader />,
    children: [
      { path: ROUTES.catalog, element: <CatalogPage /> },
      {
        path: ROUTES.productPattern,
        element: <ProductPage />,
        loader: productLoader,
        shouldRevalidate: shouldRevalidateProduct,
        errorElement: <NotFoundPage />,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
