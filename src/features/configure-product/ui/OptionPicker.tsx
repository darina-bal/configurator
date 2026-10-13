import { useId } from 'react';

import {
  getOptionValueStates,
  type OptionValueState,
  type Product,
  type ProductOption,
  type Selection,
} from '@/entities/product';
import { ChoiceGroup, type ChoiceOption } from '@/shared/ui/choice-group';

import styles from './OptionPicker.module.scss';

interface OptionPickerProps {
  product: Product;
  option: ProductOption;
  selection: Selection;
  onSelect: (optionId: string, valueId: string) => void;
}

/** Пометка значения: только недоступность. Цен в опциях нет — цена считается в блоке цены. */
function getMeta(state: OptionValueState | undefined): Pick<ChoiceOption, 'meta' | 'metaTone'> {
  if (state && !state.inStock) return { meta: 'Нет в наличии', metaTone: 'danger' };
  return {};
}

/** Один шаг конфигуратора: заголовок с выбранным значением и карточки/свотчи значений опции. */
export function OptionPicker({
  product,
  option,
  selection,
  onSelect,
}: Readonly<OptionPickerProps>) {
  const groupName = useId();
  const states = getOptionValueStates(product, selection, option.id);
  const selectedValue = option.values.find((value) => value.id === selection[option.id]);

  const choices = option.values.map<ChoiceOption>((value, index) => {
    const state = states[index];
    return {
      value: value.id,
      label: value.label,
      description: option.kind === 'swatch' ? value.code : value.hint,
      swatch: value.swatch,
      unavailable: state ? !state.inStock : false,
      ...getMeta(state),
    };
  });

  return (
    <section className={styles.root}>
      <h2 className={styles.title}>
        <span>{option.label}.</span> <span className={styles.selected}>{selectedValue?.label}</span>
      </h2>
      {option.description && <p className={styles.description}>{option.description}</p>}
      <ChoiceGroup
        name={groupName}
        legend={option.label}
        kind={option.kind}
        options={choices}
        value={selection[option.id] ?? ''}
        onChange={(valueId) => onSelect(option.id, valueId)}
      />
    </section>
  );
}
