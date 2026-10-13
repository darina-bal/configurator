import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaSlider } from './MediaSlider';
import type { MediaSlide } from './types';

const slides: MediaSlide[] = [
  { id: 'photo', kind: 'image', src: 'https://cdn.test/white.jpg', alt: 'Белый', label: 'Белый' },
  {
    id: 'diagram',
    kind: 'image',
    src: 'https://cdn.test/white.svg',
    alt: 'Чертёж',
    label: 'Чертёж',
    fit: 'contain',
  },
  {
    id: 'video',
    kind: 'video',
    src: 'https://cdn.test/promo.mp4',
    poster: 'https://cdn.test/white.jpg',
    alt: 'Видео о светильнике',
    label: 'Видео',
  },
];

const embedSlides: MediaSlide[] = [
  slides[0] as MediaSlide,
  {
    id: 'video',
    kind: 'embed',
    src: 'https://player.test/embed/1',
    poster: 'https://cdn.test/white.jpg',
    alt: 'Видео о светильнике',
    label: 'Видео',
  },
];

// jsdom не воспроизводит CSS-переходы, а при зацикливании Swiper не принимает новый переход, пока не
// закончился прежний. Поэтому слайдер тестируем в режиме «уменьшить движение»: переходы мгновенные.
beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

const mainSwiper = (container: HTMLElement) =>
  container.querySelector('.swiper:not([aria-hidden="true"])');
const activeSlide = (container: HTMLElement) => container.querySelector('.swiper-slide-active');
const activeAlt = (container: HTMLElement) =>
  activeSlide(container)?.querySelector('img')?.getAttribute('alt');
const thumbs = (container: HTMLElement) =>
  container.querySelectorAll('[aria-hidden="true"].swiper .swiper-slide');
const next = () => userEvent.click(screen.getByRole('button', { name: 'Следующий слайд' }));
const previous = () => userEvent.click(screen.getByRole('button', { name: 'Предыдущий слайд' }));

describe('MediaSlider', () => {
  it('рендерит все слайды: фото, чертёж и видео', () => {
    render(<MediaSlider slides={slides} label="Галерея товара" />);

    expect(screen.getByRole('img', { name: 'Белый' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Чертёж' })).toBeInTheDocument();
    expect(screen.getByLabelText('Видео о светильнике').tagName).toBe('VIDEO');
  });

  it('называет карусель и кнопки навигации по-русски', () => {
    render(<MediaSlider slides={slides} label="Галерея товара" />);

    expect(screen.getByRole('region', { name: 'Галерея товара' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Следующий слайд' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Предыдущий слайд' })).toBeInTheDocument();
  });

  it('начинает с первого слайда и листает кнопками-зонами по краям кадра', async () => {
    const { container } = render(<MediaSlider slides={slides} label="Галерея товара" />);
    expect(activeAlt(container)).toBe('Белый');

    await next();
    await waitFor(() => expect(activeAlt(container)).toBe('Чертёж'));

    await previous();
    await waitFor(() => expect(activeAlt(container)).toBe('Белый'));
  });

  it('зацикливается: с последнего слайда «вперёд» ведёт на первый, с первого «назад» — на последний', async () => {
    const { container } = render(<MediaSlider slides={slides} label="Галерея товара" />);

    await previous();
    await waitFor(() =>
      expect(activeSlide(container)?.querySelector('video')).toHaveAttribute(
        'aria-label',
        'Видео о светильнике',
      ),
    );

    await next();
    await waitFor(() => expect(activeAlt(container)).toBe('Белый'));
  });

  it('при зацикливании слайды не дублируются: в DOM ровно по одному на слайд', async () => {
    const { container } = render(<MediaSlider slides={slides} label="Галерея товара" />);
    const count = () => mainSwiper(container)?.querySelectorAll('.swiper-slide').length;
    expect(count()).toBe(slides.length);

    await next();
    await next();
    await next();

    expect(count()).toBe(slides.length);
    expect(screen.getAllByRole('img', { name: 'Белый' })).toHaveLength(1);
  });

  it('вписывает чертёж в кадр целиком, а фото — с заполнением', () => {
    render(<MediaSlider slides={slides} label="Галерея товара" />);

    expect(screen.getByRole('img', { name: 'Чертёж' }).className).toMatch(/contain/);
    expect(screen.getByRole('img', { name: 'Белый' }).className).not.toMatch(/contain/);
  });

  it('ставит видео на паузу при смене слайда', async () => {
    render(<MediaSlider slides={slides} label="Галерея товара" />);

    await next();

    await waitFor(() => expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled());
  });

  it('показывает ровно по миниатюре на слайд; у видео — постер и значок воспроизведения', () => {
    const { container } = render(<MediaSlider slides={slides} label="Галерея товара" />);

    const items = thumbs(container);
    expect(items).toHaveLength(slides.length);
    expect(items[0]?.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/white.jpg');
    expect(items[0]?.querySelector('svg')).toBeNull();
    expect(items[2]?.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/white.jpg');
    expect(items[2]?.querySelector('svg')).not.toBeNull();
  });

  it('подписывает миниатюры названиями слайдов', () => {
    const { container } = render(<MediaSlider slides={slides} label="Галерея товара" />);

    const titles = [...thumbs(container)].map((item) => item.getAttribute('title'));
    expect(titles).toEqual(['Белый', 'Чертёж', 'Видео']);
  });

  it('у одного слайда листать нечего: кнопки-зоны заблокированы', () => {
    render(<MediaSlider slides={slides.slice(0, 1)} label="Галерея товара" />);

    expect(screen.getByRole('button', { name: 'Следующий слайд' })).toHaveClass(
      'swiper-button-lock',
    );
    expect(screen.getByRole('button', { name: 'Предыдущий слайд' })).toHaveClass(
      'swiper-button-lock',
    );
  });
});

describe('MediaSlider: смена набора слайдов', () => {
  const swapped = slides.map((slide) =>
    slide.kind === 'image'
      ? { ...slide, src: slide.src.replace('white', 'black'), alt: `${slide.alt} (чёрный)` }
      : { ...slide, poster: 'https://cdn.test/black.jpg' },
  );

  it('слайды с прежним id остаются на месте: меняется картинка, а не элемент', () => {
    const { rerender } = render(<MediaSlider slides={slides} label="Галерея товара" />);
    const photo = screen.getByRole('img', { name: 'Белый' });

    rerender(<MediaSlider slides={swapped} label="Галерея товара" />);

    const updated = screen.getByRole('img', { name: 'Белый (чёрный)' });
    expect(updated).toBe(photo);
    expect(updated).toHaveAttribute('src', 'https://cdn.test/black.jpg');
  });

  it('не возвращает на первый слайд, когда меняется содержимое', async () => {
    const { container, rerender } = render(<MediaSlider slides={slides} label="Галерея товара" />);
    await next();
    await waitFor(() => expect(activeAlt(container)).toBe('Чертёж'));

    rerender(<MediaSlider slides={swapped} label="Галерея товара" />);

    expect(activeAlt(container)).toBe('Чертёж (чёрный)');
  });

  it('миниатюры следуют за новым набором: лишние убираются, постер обновляется', () => {
    const { container, rerender } = render(<MediaSlider slides={slides} label="Галерея товара" />);

    rerender(<MediaSlider slides={swapped.slice(0, 2)} label="Галерея товара" />);

    const items = thumbs(container);
    expect(items).toHaveLength(2);
    expect(items[0]?.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/black.jpg');
  });
});

describe('MediaSlider: плеер стороннего сервиса', () => {
  it('до нажатия показывает постер, а не iframe', () => {
    render(<MediaSlider slides={embedSlides} label="Галерея товара" />);

    expect(
      screen.getByRole('button', { name: 'Смотреть видео: Видео о светильнике' }),
    ).toBeVisible();
    expect(screen.queryByTitle('Видео о светильнике')).toBeNull();
  });

  it('по нажатию подключает плеер, а при уходе со слайда возвращает постер', async () => {
    render(<MediaSlider slides={embedSlides} label="Галерея товара" />);
    await next();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Смотреть видео: Видео о светильнике' }),
    );
    expect(screen.getByTitle('Видео о светильнике')).toHaveAttribute(
      'src',
      'https://player.test/embed/1',
    );

    await previous();

    await waitFor(() => expect(screen.queryByTitle('Видео о светильнике')).toBeNull());
    expect(
      screen.getByRole('button', { name: 'Смотреть видео: Видео о светильнике' }),
    ).toBeInTheDocument();
  });

  it('показывает у миниатюры плеера постер и значок воспроизведения', () => {
    const { container } = render(<MediaSlider slides={embedSlides} label="Галерея товара" />);

    const item = thumbs(container)[1];
    expect(item?.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/white.jpg');
    expect(item?.querySelector('svg')).not.toBeNull();
  });
});

describe('MediaSlider: полноэкранная галерея', () => {
  const dialog = () => screen.getByRole('dialog', { name: 'Галерея товара — на весь экран' });

  it('открывается кнопкой на кадре картинки; у видео такой кнопки нет', () => {
    render(<MediaSlider slides={slides} label="Галерея товара" />);

    expect(
      screen.getByRole('button', { name: 'Открыть на весь экран: Белый' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Открыть на весь экран: Чертёж' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Открыть на весь экран: Видео/ })).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('открывается на том кадре, по которому нажали', async () => {
    render(<MediaSlider slides={slides} label="Галерея товара" />);

    await userEvent.click(screen.getByRole('button', { name: 'Открыть на весь экран: Чертёж' }));

    expect(dialog()).toHaveAttribute('open');
    expect(within(dialog()).getByText('2 / 3')).toBeInTheDocument();
    expect(dialog().querySelector('.swiper-slide-active img')).toHaveAttribute('alt', 'Чертёж');
  });

  it('после закрытия обычный слайдер встаёт на тот кадр, где остановились', async () => {
    const { container } = render(<MediaSlider slides={slides} label="Галерея товара" />);
    await userEvent.click(screen.getByRole('button', { name: 'Открыть на весь экран: Белый' }));

    await userEvent.click(within(dialog()).getByRole('button', { name: 'Следующий слайд' }));
    await userEvent.click(within(dialog()).getByRole('button', { name: 'Следующий слайд' }));
    await waitFor(() => expect(within(dialog()).getByText('3 / 3')).toBeInTheDocument());
    await userEvent.click(within(dialog()).getByRole('button', { name: 'Закрыть' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() =>
      expect(
        mainSwiper(container)?.querySelector('.swiper-slide-active video'),
      ).toBeInTheDocument(),
    );
  });
});
