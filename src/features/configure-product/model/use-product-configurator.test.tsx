import { act, render, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, MemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getProductBySlug } from '@/entities/product';

import { useProductConfigurator } from './use-product-configurator';

const product = getProductBySlug('locus_duo');
if (!product) throw new Error('В каталоге нет товара locus_duo');

// Стрелочная функция, а не declaration: TS сохраняет сужение `product` только для неё.
const setup = (initialUrl = '/product/locus_duo') => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>
  );

  return renderHook(
    () => ({ configurator: useProductConfigurator(product), location: useLocation() }),
    { wrapper },
  );
};

describe('useProductConfigurator', () => {
  it('при пустом URL выбирает SKU по умолчанию: первый в наличии', () => {
    const { result } = setup();

    expect(result.current.configurator.selection).toEqual({
      track: 'recessed',
      finish: 'paint-white',
    });
    expect(result.current.configurator.variant.sku).toBe('SSD LOCUS TURN DUO 22 0427 36° APW DALI');
    expect(result.current.location.search).toBe('');
  });

  it('читает выбор из URL', () => {
    const { result } = setup('/product/locus_duo?track=surface&finish=paint-black');

    expect(result.current.configurator.variant.sku).toBe('SSD.LOCUS.DUO.50.8W.30K.15A.APB.DALI');
  });

  it('игнорирует некорректный URL и возвращает SKU по умолчанию', () => {
    const { result } = setup('/product/locus_duo?track=ceiling&finish=pink');

    expect(result.current.configurator.variant.sku).toBe('SSD LOCUS TURN DUO 22 0427 36° APW DALI');
  });

  it('select меняет опцию, сохраняя остальные, и записывает выбор в URL', () => {
    const { result } = setup();

    act(() => result.current.configurator.select('track', 'surface'));

    expect(result.current.configurator.selection).toEqual({
      track: 'surface',
      finish: 'paint-white',
    });
    expect(result.current.configurator.variant.price).toBe(18600);
    expect(new URLSearchParams(result.current.location.search).get('track')).toBe('surface');
  });

  it('select цвета не трогает трек', () => {
    const { result } = setup('/product/locus_duo?track=surface&finish=paint-white');

    act(() => result.current.configurator.select('finish', 'patina-satin'));

    expect(result.current.configurator.selection).toEqual({
      track: 'surface',
      finish: 'patina-satin',
    });
    expect(result.current.configurator.variant.stock).toBe(0);
  });
});

describe('useProductConfigurator: View Transition', () => {
  type DocumentWithTransitions = { startViewTransition?: unknown };
  const doc = document as unknown as DocumentWithTransitions;

  /** Минимальная реализация API: сразу применяет обновление DOM. */
  const stubStartViewTransition = () => {
    const start = vi.fn((update: () => void) => {
      void update();
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      };
    });
    doc.startViewTransition = start;
    return start;
  };

  // Нужен data router: опция viewTransition работает только с ним, а не с <MemoryRouter>.
  const setupDataRouter = () => {
    const probe: { current: ReturnType<typeof useProductConfigurator> | null } = { current: null };
    const Probe = () => {
      probe.current = useProductConfigurator(product);
      return null;
    };
    const router = createMemoryRouter([{ path: '*', element: <Probe /> }], {
      initialEntries: ['/product/locus_duo'],
    });
    render(<RouterProvider router={router} />);
    return { router, configurator: () => probe.current };
  };

  afterEach(() => {
    delete doc.startViewTransition;
  });

  it('запускает View Transition, когда браузер его поддерживает', async () => {
    const start = stubStartViewTransition();
    const { router, configurator } = setupDataRouter();

    await waitFor(() => expect(configurator()).not.toBeNull());
    act(() => configurator()?.select('track', 'surface'));

    await waitFor(() => expect(router.state.location.search).toContain('track=surface'));
    expect(start).toHaveBeenCalled();
  });

  it('не запрашивает переход и не засоряет консоль без поддержки браузера', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { router, configurator } = setupDataRouter();

    await waitFor(() => expect(configurator()).not.toBeNull());
    act(() => configurator()?.select('track', 'surface'));

    await waitFor(() => expect(router.state.location.search).toContain('track=surface'));
    expect(warn).not.toHaveBeenCalled();
  });

  it('не запускает переход при «уменьшить движение»', async () => {
    const start = stubStartViewTransition();
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: true, media: query }));
    const { router, configurator } = setupDataRouter();

    await waitFor(() => expect(configurator()).not.toBeNull());
    act(() => configurator()?.select('track', 'surface'));

    await waitFor(() => expect(router.state.location.search).toContain('track=surface'));
    expect(start).not.toHaveBeenCalled();
  });
});
