import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { EmbedPlayer } from './EmbedPlayer';

const props = {
  src: 'https://player.test/embed/1',
  title: 'Видео о светильнике',
  poster: 'https://cdn.test/poster.jpg',
};

describe('EmbedPlayer', () => {
  it('до нажатия показывает кнопку с постером и не подключает плеер', () => {
    const { container } = render(<EmbedPlayer {...props} />);

    expect(
      screen.getByRole('button', { name: 'Смотреть видео: Видео о светильнике' }),
    ).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', props.poster);
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('по нажатию заменяет постер плеером с нужными правами', async () => {
    const { container } = render(<EmbedPlayer {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Смотреть видео/ }));

    const frame = screen.getByTitle('Видео о светильнике');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame).toHaveAttribute('src', props.src);
    expect(frame.getAttribute('allow')).toContain('autoplay');
    expect(frame.getAttribute('allow')).toContain('fullscreen');
    expect(frame).not.toHaveAttribute('allowfullscreen'); // дублирует allow и даёт предупреждение
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('работает без постера', () => {
    const { container } = render(<EmbedPlayer src={props.src} title={props.title} />);

    expect(screen.getByRole('button', { name: /Смотреть видео/ })).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
});
