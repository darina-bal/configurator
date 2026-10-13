import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StockStatus } from './StockStatus';

describe('StockStatus', () => {
  it.each([
    [162, 'В наличии 162 шт', 'in'],
    [4, 'В наличии менее 50 шт', 'low'], // при малом остатке точное число не раскрываем
    [0, 'Нет в наличии', 'out'],
  ] as const)('остаток %i → «%s», уровень %s', (stock, text, level) => {
    render(<StockStatus stock={stock} />);

    expect(screen.getByText(text)).toHaveAttribute('data-level', level);
  });

  it('точка скрыта от скринридеров: смысл дублирует текст', () => {
    const { container } = render(<StockStatus stock={162} />);

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
