import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Слайсы выделяются заранее по роли (шапка, галерея, панель опций, корзина…): каждый новый
    // конфигуратор будет переиспользовать их, хотя сейчас потребителей один-два. Правило
    // считает ссылки только по текущему графу импортов, поэтому для нашего шаблона оно шумит
    // (например, не учитывает слайсы, подключаемые из слоя app). См. ARCHITECTURE.md, §9.
    // Частичное отключение (по files) исключает файлы из подсчёта ссылок и даёт ложные ошибки,
    // поэтому правило выключено целиком.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    // Сегмент со стилевыми partial-файлами: TS-кода нет, поэтому и Public API (index.ts) не нужен.
    files: ['./src/shared/styles/**'],
    rules: {
      'fsd/public-api': 'off',
    },
  },
]);
