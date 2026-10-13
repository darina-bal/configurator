import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MediaLightbox } from './MediaLightbox';
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

function renderLightbox({ initialIndex = 0, onClose = vi.fn(), items = slides } = {}) {
  // Переходы мгновенные (reducedMotion): jsdom не воспроизводит CSS-переходы, а при зацикливании
  // Swiper не принимает новый переход, пока не закончился прежний.
  const view = render(
    <MediaLightbox
      slides={items}
      initialIndex={initialIndex}
      label="Галерея товара"
      reducedMotion
      onClose={onClose}
    />,
  );
  return { ...view, onClose };
}

const dialog = () => screen.getByRole('dialog', { name: 'Галерея товара — на весь экран' });
const activeAlt = () => dialog().querySelector('.swiper-slide-active img')?.getAttribute('alt');
const next = () => userEvent.click(screen.getByRole('button', { name: 'Следующий слайд' }));
const previous = () => userEvent.click(screen.getByRole('button', { name: 'Предыдущий слайд' }));

describe('MediaLightbox', () => {
  it('открывается модальным диалогом с названием галереи', () => {
    renderLightbox();

    expect(dialog()).toHaveAttribute('open');
  });

  it('показывает кадр, на котором открыли, и счётчик «N / M»', () => {
    renderLightbox({ initialIndex: 1 });

    expect(activeAlt()).toBe('Чертёж');
    expect(within(dialog()).getByText('2 / 3')).toBeInTheDocument();
  });

  it('листает стрелками, обновляя счётчик, и зацикливается в обе стороны', async () => {
    renderLightbox();

    await next();
    await waitFor(() => expect(within(dialog()).getByText('2 / 3')).toBeInTheDocument());
    expect(activeAlt()).toBe('Чертёж');

    await previous();
    await previous();
    await waitFor(() => expect(within(dialog()).getByText('3 / 3')).toBeInTheDocument());

    await next();
    await waitFor(() => expect(within(dialog()).getByText('1 / 3')).toBeInTheDocument());
    expect(activeAlt()).toBe('Белый');
  });

  it('листает клавишами «вправо» и «влево»', async () => {
    renderLightbox();

    // Swiper читает устаревшее поле keyCode, а user-event его не заполняет — шлём событие сами.
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 });
    await waitFor(() => expect(within(dialog()).getByText('2 / 3')).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 });
    await waitFor(() => expect(within(dialog()).getByText('1 / 3')).toBeInTheDocument());
  });

  it('при открытии фокус стоит на самом диалоге, а не на крестике: ←/→ его не подсвечивают', async () => {
    renderLightbox();

    expect(dialog()).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Закрыть' })).not.toHaveFocus();

    // Tab по-прежнему ведёт к крестику — с клавиатуры до него можно добраться.
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Закрыть' })).toHaveFocus();
  });

  it('нажатие мышью по стрелке не забирает фокус у диалога, но листает', async () => {
    renderLightbox();
    const arrow = screen.getByRole('button', { name: 'Следующий слайд' });

    // fireEvent возвращает false, если обработчик отменил событие (preventDefault).
    expect(fireEvent.mouseDown(arrow)).toBe(false);

    await userEvent.click(arrow);
    expect(arrow).not.toHaveFocus();
    expect(dialog()).toHaveFocus();
    await waitFor(() => expect(within(dialog()).getByText('2 / 3')).toBeInTheDocument());
  });

  it('счётчик озвучивается скринридером: это область <output>', () => {
    renderLightbox();

    expect(within(dialog()).getByRole('status')).toHaveTextContent('1 / 3');
  });

  it('закрывается крестиком и сообщает, на каком кадре остановились', async () => {
    const { onClose } = renderLightbox();
    await next();
    await next();

    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

    expect(dialog).toThrow(); // диалог закрыт: недоступен для запросов по роли
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledWith(2);
  });

  it('закрытие самим браузером (клавиша Esc) тоже сообщает о закрытии', async () => {
    const { onClose } = renderLightbox({ initialIndex: 1 });

    act(() => {
      (dialog() as HTMLDialogElement).close();
    });

    await waitFor(() => expect(onClose).toHaveBeenCalledWith(1));
  });

  it('при размонтировании убирает диалог и не сообщает о закрытии', async () => {
    const { onClose, unmount } = renderLightbox();
    const element = dialog() as HTMLDialogElement;

    unmount();
    // Диалог мог бы закрыться позже: после удаления из DOM событие не должно дойти до родителя.
    act(() => {
      element.close();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(element).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('в StrictMode не закрывается сам: двойной запуск эффекта не порождает события close', async () => {
    const onClose = vi.fn();
    render(
      <StrictMode>
        <MediaLightbox
          slides={slides}
          initialIndex={0}
          label="Галерея товара"
          reducedMotion
          onClose={onClose}
        />
      </StrictMode>,
    );

    // Событие close, если бы оно было, придёт отложенно, поэтому ждём очереди задач.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(dialog()).toHaveAttribute('open');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('вписывает любое изображение целиком, а чертёж — ещё и сливает с фоном', () => {
    renderLightbox();

    expect(screen.getByRole('img', { name: 'Белый' }).className).toMatch(/contain/);
    expect(screen.getByRole('img', { name: 'Белый' }).className).not.toMatch(/multiply/);
    expect(screen.getByRole('img', { name: 'Чертёж' }).className).toMatch(/contain/);
    expect(screen.getByRole('img', { name: 'Чертёж' }).className).toMatch(/multiply/);
  });

  it('показывает видео с элементами управления и ставит его на паузу при смене слайда', async () => {
    renderLightbox({ initialIndex: 2 });

    const video = screen.getByLabelText('Видео о светильнике') as HTMLVideoElement;
    expect(video.controls).toBe(true);

    await next();

    await waitFor(() => expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled());
  });

  it('у одного слайда листать нечего: стрелки заблокированы', () => {
    renderLightbox({ items: slides.slice(0, 1) });

    expect(screen.getByRole('button', { name: 'Следующий слайд' })).toHaveClass(
      'swiper-button-lock',
    );
    expect(within(dialog()).getByText('1 / 1')).toBeInTheDocument();
  });
});
