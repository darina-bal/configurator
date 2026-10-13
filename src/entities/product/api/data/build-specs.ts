import { formatYears } from '@/shared/lib/format-years';

import type { SpecItem } from '../../model/types';

interface SpecsInput {
  /** Строка «Название» в таблице сайта: серия изделия («LOOP.RT», «SUPERSLIM DALI»). */
  series: string;
  sku: string;
  /** Оригинальное название отделки: «PAINT WHITE». */
  finish: string;
  /** Мощность, Вт. */
  power: number;
  /** Цветовая температура, K. */
  cct: number;
  /** Угол света: Medium, Wide, Spot. */
  angle: string;
  /** Степень защиты: число после «IP». */
  ip: number;
  /** Напряжение питания, В. */
  voltage: number;
  /** Гарантия, лет. */
  warranty: number;
}

/**
 * Таблица характеристик в том виде, как на странице товара centersvet.ru: те же названия строк,
 * порядок и формат значений («12W», «3000K», «220V», «IP44»). Цветопередача, качество света,
 * пульсация и управление у всех изделий одинаковы.
 */
export function buildSpecs(input: SpecsInput): SpecItem[] {
  return [
    { label: 'Название', value: input.series },
    { label: 'Артикул', value: input.sku },
    { label: 'Отделка', value: input.finish },
    { label: 'Мощность', value: `${input.power}W` },
    { label: 'Управление', value: 'DIM DALI' },
    { label: 'Температура', value: `${input.cct}K` },
    { label: 'Цветопередача', value: 'CRI>90Ra' },
    { label: 'Качество света', value: 'R9>90 (Red)' },
    { label: 'Пульсация', value: '<1%' },
    { label: 'Подключение', value: `${input.voltage}V` },
    { label: 'Угол света', value: input.angle },
    { label: 'Влагозащита', value: `IP${input.ip}` },
    { label: 'Гарантия', value: formatYears(input.warranty) },
  ];
}
