/**
 * Остаток ниже этого значения считается малым. Как на centersvet.ru, точное число при этом
 * не показываем — пишем «В наличии менее 50 шт».
 */
export const LOW_STOCK_THRESHOLD = 50;

type StockLevel = 'out' | 'low' | 'in';

export function getStockLevel(stock: number): StockLevel {
  if (stock <= 0) return 'out';
  if (stock < LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

/**
 * Подпись остатка в формулировках блока цены сайта: «В наличии 162 шт». Для нулевого остатка сайт
 * пишет «Доступно для заказа» (там можно заказать под заказ), у нас товар без остатка не продаётся.
 */
export function formatStock(stock: number): string {
  switch (getStockLevel(stock)) {
    case 'out':
      return 'Нет в наличии';
    case 'low':
      return `В наличии менее ${LOW_STOCK_THRESHOLD} шт`;
    case 'in':
      return `В наличии ${stock} шт`;
  }
}
