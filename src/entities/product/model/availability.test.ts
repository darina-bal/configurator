import { describe, expect, it } from 'vitest';

import { getOptionValueStates } from './availability';
import { testProduct } from './test-product';

describe('getOptionValueStates', () => {
  it('отдаёт состояния в том же порядке, что и значения опции', () => {
    // Порядок важен: OptionPicker сопоставляет состояния со значениями по индексу.
    // «Встроенный × чёрный» без остатка, «накладной × чёрный» в наличии.
    const states = getOptionValueStates(
      testProduct,
      { track: 'surface', finish: 'black' },
      'track',
    );

    expect(states).toEqual([{ inStock: false }, { inStock: true }]);
  });

  it('помечает значения без остатка как недоступные', () => {
    const states = getOptionValueStates(
      testProduct,
      { track: 'recessed', finish: 'white' },
      'finish',
    );
    const [white, black, gold] = states;

    expect(white?.inStock).toBe(true);
    expect(gold?.inStock).toBe(true);
    expect(black?.inStock).toBe(false);
  });

  it('учитывает подбор ближайшего SKU при несуществующей комбинации', () => {
    const states = getOptionValueStates(
      testProduct,
      { track: 'recessed', finish: 'gold' },
      'track',
    );
    const [, surface] = states;

    // «накладной × золото» нет → наличие считается по ближайшему реальному SKU, а не «нет SKU —
    // нет в наличии»
    expect(surface?.inStock).toBe(true);
  });

  it('возвращает пустой список для неизвестной опции', () => {
    expect(
      getOptionValueStates(testProduct, { track: 'recessed', finish: 'white' }, 'size'),
    ).toEqual([]);
  });
});
