/** Маршруты приложения. Паттерны — для роутера, функции — для построения ссылок. */
export const ROUTES = {
  catalog: '/',
  productPattern: '/product/:slug',
  product: (slug: string) => `/product/${slug}`,
} as const;
