import { describe, expect, it } from 'vitest';

import { formatYears } from './format-years';

describe('formatYears', () => {
  it.each([
    [1, '1 год'],
    [2, '2 года'],
    [4, '4 года'],
    [5, '5 лет'],
    [11, '11 лет'],
    [14, '14 лет'],
    [21, '21 год'],
    [22, '22 года'],
    [100, '100 лет'],
  ])('%i → «%s»', (years, expected) => {
    expect(formatYears(years)).toBe(expected);
  });
});
