import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routes } from './routes';

// Страница товара с Swiper рендерится заметно дольше секунды, когда все тесты идут параллельно:
// стандартных 1000 мс ожидания не хватает, поэтому ждём с запасом.
const PAGE_RENDER = { timeout: 8000 };

/** Рендерит приложение и дожидается содержимого страницы (loader + асинхронный рендер роутера). */
async function renderApp(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const view = render(<RouterProvider router={router} />);
  await screen.findByRole('main', undefined, PAGE_RENDER);
  return { router, ...view };
}

const cartStatus = () => within(screen.getByRole('banner')).getByRole('status');

describe('маршруты приложения', () => {
  it('на главной показывает каталог с шапкой и подвалом', async () => {
    await renderApp('/');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Конфигуратор светильников' }),
    ).toBeInTheDocument();
  });

  it('из каталога ведёт на страницу конфигуратора выбранного товара', async () => {
    const { router } = await renderApp('/');

    await userEvent.click(screen.getByRole('heading', { name: 'LOCUS DUO' }));

    await waitFor(
      () => expect(router.state.location.pathname).toBe('/product/locus_duo'),
      PAGE_RENDER,
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'LOCUS DUO' }, PAGE_RENDER),
    ).toBeInTheDocument();
  });

  it('показывает страницу «не найдено» для неизвестного адреса', async () => {
    await renderApp('/nowhere');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Страница не найдена' }),
    ).toBeInTheDocument();
  });

  it('показывает страницу «не найдено» для неизвестного товара, сохраняя шапку и подвал', async () => {
    await renderApp('/product/unknown');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Страница не найдена' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it.each(['/', '/product/loop_rt_main', '/product/locus_duo', '/nowhere'])(
    'на странице %s все настоящие ссылки ведут внутрь прототипа, а не на сайт',
    async (url) => {
      const { container } = await renderApp(url);

      const hrefs = [...container.querySelectorAll('a[href]')].map((link) =>
        link.getAttribute('href'),
      );
      expect(hrefs.length).toBeGreaterThan(0); // хотя бы логотип в шапке
      for (const href of hrefs) expect(href, `ссылка ${href}`).toMatch(/^\/(?!\/)/);
      expect(container.querySelectorAll('[target]')).toHaveLength(0);
    },
  );

  it('товар из страницы конфигуратора попадает в корзину, счётчик в шапке растёт', async () => {
    await renderApp('/product/loop_rt_main?finish=paint-black');
    // Стор корзины общий для всех тестов файла, поэтому сравниваем с исходным значением.
    const before = Number(cartStatus().textContent?.replace(/\D/g, '') ?? 0);

    await userEvent.click(screen.getByRole('button', { name: 'Добавить в корзину' }));

    expect(Number(cartStatus().textContent?.replace(/\D/g, ''))).toBe(before + 1);
  });
});
