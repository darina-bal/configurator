import { describe, expect, it } from 'vitest';

import { formatStock, getStockLevel, LOW_STOCK_THRESHOLD } from './stock';

describe('getStockLevel', () => {
  it.each([
    [0, 'out'],
    [-3, 'out'],
    [1, 'low'],
    [LOW_STOCK_THRESHOLD - 1, 'low'],
    [LOW_STOCK_THRESHOLD, 'in'],
    [162, 'in'],
  ] as const)('остаток %i → %s', (stock, level) => {
    expect(getStockLevel(stock)).toBe(level);
  });
});

describe('formatStock', () => {
  it('пишет подписи в формулировках блока цены сайта', () => {
    expect(formatStock(0)).toBe('Нет в наличии');
    expect(formatStock(162)).toBe('В наличии 162 шт');
    expect(formatStock(LOW_STOCK_THRESHOLD)).toBe('В наличии 50 шт');
  });

  it('для малого остатка не раскрывает точное число', () => {
    expect(formatStock(4)).toBe('В наличии менее 50 шт');
    expect(formatStock(LOW_STOCK_THRESHOLD - 1)).toBe('В наличии менее 50 шт');
  });
});
