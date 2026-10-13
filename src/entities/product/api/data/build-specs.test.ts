import { describe, expect, it } from 'vitest';

import { buildSpecs } from './build-specs';

const base = {
  series: 'LOOP.RT',
  sku: 'LOOP.RT80.12W.30K.80A.APW.DALI',
  finish: 'PAINT WHITE',
  power: 12,
  cct: 3000,
  angle: 'Medium',
  ip: 44,
  voltage: 220,
  warranty: 2,
};

describe('buildSpecs', () => {
  it('даёт строки в порядке и с названиями таблицы на centersvet.ru', () => {
    expect(buildSpecs(base).map((spec) => spec.label)).toEqual([
      'Название',
      'Артикул',
      'Отделка',
      'Мощность',
      'Управление',
      'Температура',
      'Цветопередача',
      'Качество света',
      'Пульсация',
      'Подключение',
      'Угол света',
      'Влагозащита',
      'Гарантия',
    ]);
  });

  it('начинает с серии и артикула', () => {
    const specs = buildSpecs(base);
    expect(specs[0]).toEqual({ label: 'Название', value: 'LOOP.RT' });
    expect(specs[1]).toEqual({ label: 'Артикул', value: base.sku });
  });

  it('форматирует значения как на сайте: «12W», «3000K», «220V», «IP44»', () => {
    const specs = buildSpecs(base);
    expect(specs).toContainEqual({ label: 'Мощность', value: '12W' });
    expect(specs).toContainEqual({ label: 'Температура', value: '3000K' });
    expect(specs).toContainEqual({ label: 'Подключение', value: '220V' });
    expect(specs).toContainEqual({ label: 'Влагозащита', value: 'IP44' });
    expect(specs).toContainEqual({ label: 'Угол света', value: 'Medium' });
  });

  it('склоняет гарантию', () => {
    expect(buildSpecs(base).at(-1)).toEqual({ label: 'Гарантия', value: '2 года' });
    expect(buildSpecs({ ...base, warranty: 5 }).at(-1)).toEqual({
      label: 'Гарантия',
      value: '5 лет',
    });
  });
});
