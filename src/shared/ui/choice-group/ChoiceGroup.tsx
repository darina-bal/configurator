import clsx from 'clsx';

import styles from './ChoiceGroup.module.scss';

export interface ChoiceOption {
  value: string;
  label: string;
  /** Пояснение под названием (подсказка или оригинальное название отделки). */
  description?: string;
  /** CSS-цвет кружка для kind="swatch". */
  swatch?: string;
  /** Короткая пометка рядом с названием: «Нет в наличии» и т.п. */
  meta?: string;
  metaTone?: 'default' | 'danger';
  /** Значение нет в наличии: его по-прежнему можно выбрать, но оно визуально приглушено. */
  unavailable?: boolean;
}

interface ChoiceGroupProps {
  /** Общее имя радиокнопок группы (уникальное в пределах страницы). */
  name: string;
  /** Доступное название группы; видимый заголовок рисует вызывающий код. */
  legend: string;
  kind: 'card' | 'swatch';
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Выбор одного значения из нескольких: карточки или цветные свотчи.
 * Построен на нативных radio — стрелки, Tab и скринридеры работают без ручной ARIA-логики.
 */
export function ChoiceGroup({
  name,
  legend,
  kind,
  options,
  value,
  onChange,
}: Readonly<ChoiceGroupProps>) {
  return (
    <fieldset className={clsx(styles.group, styles[kind])}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.list}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              className={styles.input}
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className={clsx(styles.face, option.unavailable && styles.unavailable)}>
              {kind === 'swatch' && (
                <span
                  className={styles.dot}
                  style={{ backgroundColor: option.swatch }}
                  aria-hidden="true"
                />
              )}
              <span className={styles.label}>{option.label}</span>
              {option.meta && (
                <span className={clsx(styles.meta, option.metaTone === 'danger' && styles.danger)}>
                  {option.meta}
                </span>
              )}
              {option.description && (
                <span className={styles.description}>{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
