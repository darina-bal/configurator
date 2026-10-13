const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

/** Форматирует сумму в рублях: 4800 → «4 800 ₽» (разделитель — неразрывный пробел). */
export function formatPrice(value: number): string {
  return rubFormatter.format(value);
}
