import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getProductBySlug } from '@/entities/product';

import { ProductGallery } from './ProductGallery';

const preloadImages = vi.hoisted(() => vi.fn<(urls: readonly string[]) => () => void>());

vi.mock('@/shared/lib/preload-image', () => ({ preloadImages }));

const locus = getProductBySlug('locus_duo');
const loop = getProductBySlug('loop_rt_main');
const [recessedWhite, recessedBlack] = locus?.variants ?? [];
const surfacePatina = locus?.variants.at(-1);
const loopWhite = loop?.variants[0];
if (!locus || !loop || !recessedWhite || !recessedBlack || !surfacePatina || !loopWhite) {
  throw new Error('Нет данных каталога');
}
const recessedDiagram = recessedWhite.diagram;
const surfaceDiagram = surfacePatina.diagram;
if (!recessedDiagram || !surfaceDiagram) throw new Error('У LOCUS DUO нет чертежей');

const thumbs = (container: HTMLElement) => [
  ...container.querySelectorAll('[aria-hidden="true"].swiper .swiper-slide'),
];
const activeImage = (container: HTMLElement) =>
  container.querySelector('.swiper-slide-active img')?.getAttribute('alt');

beforeEach(() => {
  preloadImages.mockReset();
  preloadImages.mockReturnValue(() => undefined);
});

describe('ProductGallery', () => {
  it('называет галерею по товару', () => {
    render(<ProductGallery product={locus} variant={recessedWhite} />);

    expect(screen.getByRole('region', { name: 'Галерея: LOCUS DUO' })).toBeInTheDocument();
  });

  it('содержит только материалы выбранного SKU: его фото, чертёж и видео', () => {
    render(<ProductGallery product={locus} variant={recessedBlack} />);

    expect(screen.getByRole('img', { name: recessedBlack.photo.alt })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: recessedDiagram.alt })).toBeInTheDocument();
    expect(screen.getByLabelText('Видео о системе SUPERSLIM DALI').tagName).toBe('VIDEO');
    // Больше изображений с подписью нет: ни других цветов, ни чертежа другого трека.
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('показывает превью только этого SKU: фото, чертёж и видео', () => {
    const { container } = render(<ProductGallery product={locus} variant={recessedBlack} />);

    const items = thumbs(container);
    expect(items.map((item) => item.getAttribute('title'))).toEqual([
      'Встроенный · Чёрный',
      'Чертёж',
      'Видео',
    ]);
    expect(items.map((item) => item.querySelector('img')?.getAttribute('src'))).toEqual([
      recessedBlack.photo.src,
      recessedDiagram.src,
      recessedBlack.photo.src, // постер видео — фото этого же SKU
    ]);
  });

  it('при смене SKU заменяет фото, чертёж и превью, а число слайдов не меняется', () => {
    const { container, rerender } = render(
      <ProductGallery product={locus} variant={recessedWhite} />,
    );

    rerender(<ProductGallery product={locus} variant={surfacePatina} />);

    expect(screen.getByRole('img', { name: surfacePatina.photo.alt })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: surfaceDiagram.alt })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: recessedWhite.photo.alt })).toBeNull();
    expect(screen.queryByRole('img', { name: recessedDiagram.alt })).toBeNull();
    expect(thumbs(container).map((item) => item.querySelector('img')?.getAttribute('src'))).toEqual(
      [surfacePatina.photo.src, surfaceDiagram.src, surfacePatina.photo.src],
    );
  });

  it('при смене SKU остаётся на том слайде, который смотрит пользователь', async () => {
    const { container, rerender } = render(
      <ProductGallery product={locus} variant={recessedWhite} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Следующий слайд' }));
    await waitFor(() => expect(activeImage(container)).toBe(recessedDiagram.alt));

    rerender(<ProductGallery product={locus} variant={surfacePatina} />);

    expect(activeImage(container)).toBe(surfaceDiagram.alt);
  });

  it('полноэкранная галерея открывается на слайдах выбранного SKU и следует за сменой SKU', async () => {
    const { rerender } = render(<ProductGallery product={locus} variant={recessedWhite} />);
    rerender(<ProductGallery product={locus} variant={surfacePatina} />);

    await userEvent.click(
      screen.getByRole('button', { name: `Открыть на весь экран: ${surfacePatina.photo.alt}` }),
    );

    const dialog = screen.getByRole('dialog', { name: 'Галерея: LOCUS DUO — на весь экран' });
    expect(within(dialog).getByRole('img', { name: surfacePatina.photo.alt })).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: surfaceDiagram.alt })).toBeInTheDocument();
    expect(within(dialog).queryByRole('img', { name: recessedWhite.photo.alt })).toBeNull();
    expect(within(dialog).getByText('1 / 3')).toBeInTheDocument();
  });

  it('у товара с плеером Kinescope показывает постер-кнопку вместо видеофайла', () => {
    const { container } = render(<ProductGallery product={loop} variant={loopWhite} />);

    expect(
      screen.getByRole('button', { name: 'Смотреть видео: Видео о светильнике LOOP.RT' }),
    ).toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
    expect(thumbs(container)).toHaveLength(3);
  });

  it('заранее подгружает фото и чертежи всех SKU, чтобы смена кадра не ждала сеть', () => {
    render(<ProductGallery product={locus} variant={recessedWhite} />);

    expect(preloadImages).toHaveBeenCalledTimes(1);
    const urls = preloadImages.mock.calls[0]?.[0] ?? [];
    for (const variant of locus.variants) {
      expect(urls).toContain(variant.photo.src);
      expect(urls).toContain(variant.diagram?.src);
    }
  });

  it('не перезапускает предзагрузку при смене SKU и отменяет её при размонтировании', () => {
    const cancel = vi.fn();
    preloadImages.mockReturnValue(cancel);
    const { rerender, unmount } = render(
      <ProductGallery product={locus} variant={recessedWhite} />,
    );

    rerender(<ProductGallery product={locus} variant={surfacePatina} />);
    expect(preloadImages).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();

    unmount();
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
