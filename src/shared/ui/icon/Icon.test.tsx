import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Icon } from './Icon';

const svgOf = (container: HTMLElement) => container.querySelector('svg') as SVGSVGElement;

describe('Icon', () => {
  it('скрыта от скринридеров и не принимает фокус', () => {
    const { container } = render(<Icon name="cart" />);
    expect(svgOf(container)).toHaveAttribute('aria-hidden', 'true');
    expect(svgOf(container)).toHaveAttribute('focusable', 'false');
  });

  it('по умолчанию квадратная 24 px', () => {
    const { container } = render(<Icon name="check" />);
    expect(svgOf(container)).toHaveAttribute('width', '24');
    expect(svgOf(container)).toHaveAttribute('height', '24');
  });

  it('ширина следует пропорциям иконки: size задаёт высоту', () => {
    const { container } = render(<Icon name="download" size={17} />);
    expect(svgOf(container)).toHaveAttribute('height', '17');
    expect(Number(svgOf(container).getAttribute('width'))).toBeCloseTo(15, 5); // 15 × 17
  });

  it.each(['minus', 'plus', 'cart-button'] as const)(
    'рисует значок %s блока цены линиями цвета текста',
    (name) => {
      const { container } = render(<Icon name={name} />);
      expect(svgOf(container)).toHaveAttribute('stroke', 'currentColor');
      expect(svgOf(container).querySelector('path')).not.toBeNull();
    },
  );

  it.each(['cart', 'search', 'globe', 'user', 'burger', 'close'] as const)(
    'рисует значок %s шапки линиями цвета текста',
    (name) => {
      const { container } = render(<Icon name={name} />);
      expect(svgOf(container)).toHaveAttribute('stroke', 'currentColor');
      expect(svgOf(container)).toHaveAttribute('fill', 'none');
      expect(svgOf(container).querySelector('path')).not.toBeNull();
    },
  );

  it('шеврон слайдера — контур 1px цвета текста, смотрит вправо', () => {
    const { container } = render(<Icon name="chevron" />);
    expect(svgOf(container)).toHaveAttribute('stroke', 'currentColor');
    expect(svgOf(container)).toHaveAttribute('stroke-width', '1');
    expect(svgOf(container)).toHaveAttribute('fill', 'none');
  });

  it('длинная стрелка полноэкранной галереи — заливка цвета текста пропорций 40×13', () => {
    const { container } = render(<Icon name="arrow-long" size={13} />);
    expect(svgOf(container)).toHaveAttribute('fill', 'currentColor');
    expect(svgOf(container)).toHaveAttribute('width', '40');
    expect(svgOf(container)).toHaveAttribute('height', '13');
  });

  it('кнопка меню в рамке 27×20 px, как на сайте: размер задаёт высоту', () => {
    const { container } = render(<Icon name="burger" size={20} />);
    expect(svgOf(container)).toHaveAttribute('width', '27');
    expect(svgOf(container)).toHaveAttribute('height', '20');
  });

  it('у каждой иконки свой стиль рисования: контур или заливка', () => {
    const stroke = render(<Icon name="download" />).container;
    expect(svgOf(stroke)).toHaveAttribute('stroke', 'currentColor');
    expect(svgOf(stroke)).toHaveAttribute('fill', 'none');

    const fill = render(<Icon name="cube" />).container;
    expect(svgOf(fill)).toHaveAttribute('fill', 'currentColor');
  });
});
