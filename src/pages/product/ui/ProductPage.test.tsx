import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/shared/config';

import { productLoader, shouldRevalidateProduct } from '../model/product-loader';
import { ProductPage } from './ProductPage';

async function renderProductPage(url: string, loader = productLoader) {
  const router = createMemoryRouter(
    [
      {
        path: ROUTES.productPattern,
        element: <ProductPage />,
        loader,
        shouldRevalidate: shouldRevalidateProduct,
        errorElement: <p>Товар не найден</p>,
      },
    ],
    { initialEntries: [url] },
  );
  const view = render(<RouterProvider router={router} />);
  // Страница (или errorElement) появляется после выполнения loader и асинхронного рендера роутера.
  // Страница со Swiper при параллельном прогоне тестов рендерится дольше стандартной секунды.
  await waitFor(
    () =>
      expect(screen.queryByRole('main') ?? screen.queryByText('Товар не найден')).not.toBeNull(),
    { timeout: 8000 },
  );
  return { router, ...view };
}

const normalized = (element: Element | null) => element?.textContent?.replace(/\s/g, ' ');
const summary = () => screen.getByRole('region', { name: 'Стоимость и наличие' });
const specs = () => screen.getByRole('region', { name: 'Характеристики' });
const description = () => screen.getByRole('region', { name: 'Описание' });
const heading = (name: RegExp | string) => screen.getByRole('heading', { level: 2, name });
// Смена опции меняет URL, а роутер применяет навигацию асинхронно — ждём новый заголовок шага.
const findHeading = (name: RegExp | string) => screen.findByRole('heading', { level: 2, name });
const activePhoto = (container: HTMLElement) =>
  container.querySelector('.swiper-slide-active img')?.getAttribute('alt');
/** Галерея слева от опций: единственное место страницы с фото и чертежом выбранного SKU. */
const gallery = () => within(screen.getByRole('region', { name: /^Галерея:/ }));
/** Превью под слайдером: название каждого слайда (атрибут title). */
const thumbTitles = (container: HTMLElement) =>
  [...container.querySelectorAll('[aria-hidden="true"].swiper .swiper-slide')].map((item) =>
    item.getAttribute('title'),
  );

describe('ProductPage: LOOP.RT (одна опция — цвет)', () => {
  it('показывает конфигурацию по умолчанию', async () => {
    const { container } = await renderProductPage('/product/loop_rt_main');

    expect(screen.getByRole('heading', { level: 1, name: 'LOOP.RT' })).toBeInTheDocument();
    expect(heading('Цвет. Белый')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Трек' })).not.toBeInTheDocument();
    expect(normalized(summary())).toContain('4 800 ₽');
    expect(summary()).toHaveTextContent('В наличии 162 шт');
    expect(specs()).toHaveTextContent('LOOP.RT80.12W.30K.80A.APW.DALI');
    expect(activePhoto(container)).toBe('LOOP.RT — Белый');
  });

  it('смена цвета меняет остаток, характеристики, фото и адрес страницы', async () => {
    const { router, container } = await renderProductPage('/product/loop_rt_main');

    await userEvent.click(screen.getByRole('radio', { name: /Тёмная латунь/ }));

    expect(await findHeading('Цвет. Тёмная латунь')).toBeInTheDocument();
    expect(normalized(summary())).toContain('4 800 ₽'); // цена у всех отделок одна
    expect(summary()).toHaveTextContent('В наличии 190 шт');
    expect(specs()).toHaveTextContent('LOOP.RT80.12W.30K.80A.BPD.DALI');
    expect(specs()).toHaveTextContent('Wide');
    expect(router.state.location.search).toBe('?finish=dark-brass');
    await waitFor(() => expect(activePhoto(container)).toBe('LOOP.RT — Тёмная латунь'));
  });

  it('в галерее — фото выбранного цвета, чертёж и видео этого светильника', async () => {
    const { container } = await renderProductPage('/product/loop_rt_main?finish=paint-black');

    expect(thumbTitles(container)).toEqual(['Чёрный', 'Чертёж', 'Видео']);
    expect(gallery().getByRole('img', { name: 'LOOP.RT — Чёрный' })).toBeInTheDocument();
    expect(gallery().queryByRole('img', { name: 'LOOP.RT — Белый' })).toBeNull();
    expect(
      gallery().getByRole('img', { name: 'LOOP.RT — чертёж с размерами' }),
    ).toBeInTheDocument();
    expect(
      gallery().getByRole('button', { name: 'Смотреть видео: Видео о светильнике LOOP.RT' }),
    ).toBeInTheDocument();
  });
});

describe('ProductPage: LOCUS DUO (трек × цвет)', () => {
  it('начинает с первого SKU в наличии: встроенный белый', async () => {
    await renderProductPage('/product/locus_duo');

    expect(heading('Трек. Встроенный')).toBeInTheDocument();
    expect(heading('Цвет. Белый')).toBeInTheDocument();
    expect(normalized(summary())).toContain('10 800 ₽');
    expect(summary()).toHaveTextContent('В наличии 199 шт');
  });

  it('читает конфигурацию из адреса страницы', async () => {
    await renderProductPage('/product/locus_duo?track=surface&finish=paint-black');

    expect(heading('Трек. Накладной')).toBeInTheDocument();
    expect(heading('Цвет. Чёрный')).toBeInTheDocument();
    expect(normalized(summary())).toContain('18 600 ₽');
    expect(summary()).toHaveTextContent('В наличии 194 шт');
  });

  it('смена трека меняет цену, остаток, описание, характеристики и фото', async () => {
    const { container } = await renderProductPage('/product/locus_duo');
    expect(description()).toHaveTextContent('для встроенного трека');
    expect(specs()).toHaveTextContent('4W');

    await userEvent.click(screen.getByRole('radio', { name: /Накладной/ }));

    expect(await findHeading('Трек. Накладной')).toBeInTheDocument();
    expect(heading('Цвет. Белый')).toBeInTheDocument(); // цвет сохраняется
    expect(normalized(summary())).toContain('18 600 ₽');
    expect(summary()).toHaveTextContent('В наличии 99 шт');
    expect(description()).toHaveTextContent('для накладного трека');
    expect(specs()).toHaveTextContent('8W');
    await waitFor(() => expect(activePhoto(container)).toBe('LOCUS DUO — Накладной трек, Белый'));
  });

  it('цвет без остатка помечен недоступным: кнопка отключена, цена показана', async () => {
    await renderProductPage('/product/locus_duo?track=surface&finish=paint-white');

    await userEvent.click(screen.getByRole('radio', { name: /Патина/ }));

    expect(await findHeading('Цвет. Патина')).toBeInTheDocument();
    expect(normalized(summary())).toContain('20 800 ₽');
    expect(within(summary()).getByText('Нет в наличии')).toHaveAttribute('data-level', 'out');
    expect(within(summary()).getByRole('button', { name: 'Нет в наличии' })).toBeDisabled();

    // Возврат на встроенный трек сохраняет цвет, но цена и остаток — уже другого SKU.
    await userEvent.click(screen.getByRole('radio', { name: /Встроенный/ }));

    expect(await findHeading('Трек. Встроенный')).toBeInTheDocument();
    expect(heading('Цвет. Патина')).toBeInTheDocument();
    expect(normalized(summary())).toContain('10 800 ₽');
    expect(within(summary()).getByRole('button', { name: 'Нет в наличии' })).toBeDisabled();
  });

  it('держит блок цены и «в корзину» после опций, а детали — после них', async () => {
    await renderProductPage('/product/locus_duo');

    const lastRadio = screen.getAllByRole('radio').at(-1);
    const button = screen.getByRole('button', { name: 'Добавить в корзину' });
    expect(lastRadio?.compareDocumentPosition(button)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(button.compareDocumentPosition(description())).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('в галерее и превью — только материалы выбранной конфигурации', async () => {
    const { container } = await renderProductPage('/product/locus_duo');
    expect(thumbTitles(container)).toEqual(['Встроенный · Белый', 'Чертёж', 'Видео']);
    expect(gallery().getAllByRole('img')).toHaveLength(2); // фото и чертёж, чужих кадров нет
    const recessedDiagram = gallery()
      .getByRole('img', { name: /чертёж/ })
      .getAttribute('src');

    await userEvent.click(screen.getByRole('radio', { name: /Накладной/ }));
    await findHeading('Трек. Накладной');

    await waitFor(() =>
      expect(thumbTitles(container)).toEqual(['Накладной · Белый', 'Чертёж', 'Видео']),
    );
    expect(gallery().getAllByRole('img')).toHaveLength(2);
    expect(
      gallery().getByRole('img', { name: 'LOCUS DUO — Накладной трек, Белый' }),
    ).toBeInTheDocument();
    // У накладного трека свой чертёж.
    expect(
      gallery()
        .getByRole('img', { name: /чертёж/ })
        .getAttribute('src'),
    ).not.toBe(recessedDiagram);
  });

  it('фото и чертёж есть только в галерее: блок деталей ниже их не повторяет', async () => {
    await renderProductPage('/product/locus_duo');

    const pageImages = within(screen.getByRole('main')).getAllByRole('img');
    expect(pageImages).toHaveLength(gallery().getAllByRole('img').length);
  });

  it('листание галереи не меняет выбранную конфигурацию', async () => {
    const { router } = await renderProductPage('/product/locus_duo');

    await userEvent.click(screen.getByRole('button', { name: 'Следующий слайд' }));

    expect(heading('Трек. Встроенный')).toBeInTheDocument();
    expect(heading('Цвет. Белый')).toBeInTheDocument();
    expect(router.state.location.search).toBe('');
  });

  it('при смене опции остаётся на том слайде, который смотрит пользователь', async () => {
    const { container } = await renderProductPage('/product/locus_duo');
    await userEvent.click(screen.getByRole('button', { name: 'Следующий слайд' }));
    await waitFor(() => expect(activePhoto(container)).toMatch(/чертёж/));

    await userEvent.click(screen.getByRole('radio', { name: /Накладной/ }));
    await findHeading('Трек. Накладной');

    await waitFor(() =>
      expect(activePhoto(container)).toBe('LOCUS DUO, накладной трек — чертёж с размерами'),
    );
  });

  it('не показывает хлебные крошки', async () => {
    await renderProductPage('/product/locus_duo');

    expect(within(screen.getByRole('main')).queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Главная' })).toBeNull();
  });

  it('смена опций не перезапускает loader: товар загружается один раз', async () => {
    const loader = vi.fn(productLoader);
    await renderProductPage('/product/locus_duo', loader);

    await userEvent.click(screen.getByRole('radio', { name: /Накладной/ }));
    await findHeading('Трек. Накладной');
    await userEvent.click(screen.getByRole('radio', { name: /Чёрный/ }));
    await findHeading('Цвет. Чёрный');

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('добавляет выбранный SKU в корзину', async () => {
    await renderProductPage('/product/locus_duo?track=surface&finish=paint-black');

    await userEvent.click(screen.getByRole('button', { name: 'Добавить в корзину' }));

    expect(screen.getByRole('button', { name: 'Добавлено' })).toBeInTheDocument();
  });
});

describe('ProductPage: неизвестный товар', () => {
  it('отдаёт 404 через errorElement роутера', async () => {
    await renderProductPage('/product/unknown');

    expect(screen.getByText('Товар не найден')).toBeInTheDocument();
  });
});
