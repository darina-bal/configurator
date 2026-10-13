import { Fragment, type ReactNode } from 'react';

import type { SpecItem } from '@/entities/product';

import styles from './SpecsTable.module.scss';

interface SpecsTableProps {
  specs: SpecItem[];
}

/**
 * Позволяет длинному значению (артикулу) переноситься после точек, а не посреди слова.
 * `<wbr>` не добавляет текста, поэтому доступное имя и textContent остаются прежними.
 */
function breakAfterDots(value: string): ReactNode {
  const parts = value.split('.');
  return parts.map((part, index) => (
    <Fragment key={`${index}-${part}`}>
      {part}
      {index < parts.length - 1 && (
        <>
          .<wbr />
        </>
      )}
    </Fragment>
  ));
}

/** Серая плашка с таблицей характеристик: слева название (приглушено), справа значение. */
export function SpecsTable({ specs }: Readonly<SpecsTableProps>) {
  return (
    <section className={styles.panel} aria-label="Характеристики">
      <dl className={styles.list}>
        {specs.map((spec) => (
          <div key={spec.label} className={styles.row}>
            <dt className={styles.name}>{spec.label}</dt>
            <dd className={styles.value}>{breakAfterDots(spec.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
