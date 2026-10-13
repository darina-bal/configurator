import { describe, expect, it } from 'vitest';

import { formatPrice } from './format-price';

// Intl использует неразрывные пробелы; \s захватывает и их — приводим к обычным для читаемости.
const normalize = (text: string) => text.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('форматирует рубли с разделителем тысяч и без копеек', () => {
    expect(normalize(formatPrice(4800))).toBe('4 800 ₽');
    expect(normalize(formatPrice(20800))).toBe('20 800 ₽');
    expect(normalize(formatPrice(950))).toBe('950 ₽');
  });

  it('округляет дробную часть', () => {
    expect(normalize(formatPrice(4800.4))).toBe('4 800 ₽');
  });
});
