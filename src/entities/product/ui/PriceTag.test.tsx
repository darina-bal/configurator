import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PriceTag } from './PriceTag';

const text = (container: HTMLElement) => container.textContent?.replace(/\s/g, ' ');

describe('PriceTag', () => {
  it('форматирует цену в рублях', () => {
    const { container } = render(<PriceTag value={18600} />);
    expect(text(container)).toBe('18 600 ₽');
  });

  it('добавляет «от» для минимальной цены', () => {
    const { container } = render(<PriceTag value={4800} from />);
    expect(text(container)).toBe('от 4 800 ₽');
  });
});
