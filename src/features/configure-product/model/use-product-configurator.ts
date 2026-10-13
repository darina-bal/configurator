import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
  applyOption,
  findVariant,
  getDefaultVariant,
  parseSelection,
  serializeSelection,
  type Product,
  type ProductVariant,
  type Selection,
} from '@/entities/product';
import { canUseViewTransition } from '@/shared/lib/can-use-view-transition';

interface ProductConfigurator {
  /** Текущий выбор по всем опциям товара. */
  selection: Selection;
  /** SKU, соответствующий выбору. */
  variant: ProductVariant;
  /** Меняет значение одной опции; при отсутствии такой комбинации подбирает ближайший SKU. */
  select: (optionId: string, valueId: string) => void;
}

/**
 * Состояние конфигуратора товара. Источник правды — параметры URL (?track=…&finish=…):
 * ссылка на конкретную конфигурацию делится, кнопки браузера «назад/вперёд» работают.
 * Пустой или некорректный URL даёт SKU по умолчанию.
 */
export function useProductConfigurator(product: Product): ProductConfigurator {
  const [searchParams, setSearchParams] = useSearchParams();

  const selection = useMemo(() => parseSelection(product, searchParams), [product, searchParams]);
  const variant = useMemo(
    () => findVariant(product, selection) ?? getDefaultVariant(product),
    [product, selection],
  );

  const commit = useCallback(
    (next: Selection) => {
      setSearchParams(serializeSelection(next), {
        // replace: выбор опций не засоряет историю браузера.
        replace: true,
        preventScrollReset: true,
        // Смену кадра галереи плавно делает View Transition браузера (стили — в shared/styles);
        // при «уменьшить движение» и в браузерах без поддержки кадр меняется сразу.
        viewTransition: canUseViewTransition(),
      });
    },
    [setSearchParams],
  );

  const select = useCallback(
    (optionId: string, valueId: string) => {
      commit(applyOption(product, selection, optionId, valueId));
    },
    [product, selection, commit],
  );

  return { selection, variant, select };
}
