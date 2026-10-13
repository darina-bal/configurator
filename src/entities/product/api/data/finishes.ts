import type { OptionValue } from '../../model/types';

/**
 * Отделки корпусов. Названия `code` — как на centersvet.ru; цвета кружков подобраны по фото товаров.
 * Общие для всех товаров: у разных светильников одна и та же отделка выглядит одинаково.
 */
export const FINISH = {
  paintWhite: { id: 'paint-white', label: 'Белый', code: 'PAINT WHITE', swatch: '#f4f4f2' },
  paintBlack: { id: 'paint-black', label: 'Чёрный', code: 'PAINT BLACK', swatch: '#1d1d1d' },
  patinaBrass: {
    id: 'patina-brass',
    label: 'Патина латунь',
    code: 'PATINA BRASS',
    swatch: '#b39455',
  },
  patinaSatin: { id: 'patina-satin', label: 'Патина', code: 'PATINA SATIN', swatch: '#b39455' },
  darkBrass: { id: 'dark-brass', label: 'Тёмная латунь', code: 'DARK BRASS', swatch: '#4f4842' },
} as const satisfies Record<string, OptionValue>;
