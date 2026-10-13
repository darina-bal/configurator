import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SpecsTable } from './SpecsTable';

const specs = [
  { label: 'Название', value: 'LOOP.RT' },
  { label: 'Артикул', value: 'LOOP.RT80.12W.30K.80A.APW.DALI' },
  { label: 'Пульсация', value: '<1%' },
];

describe('SpecsTable', () => {
  it('рисует строку «название — значение» для каждой характеристики', () => {
    render(<SpecsTable specs={specs} />);

    const table = screen.getByRole('region', { name: 'Характеристики' });
    expect(table).toHaveTextContent('Название');
    expect(table).toHaveTextContent('Пульсация');
    expect(screen.getAllByRole('term')).toHaveLength(3);
    expect(screen.getAllByRole('definition')).toHaveLength(3);
  });

  it('сохраняет текст значений нетронутым', () => {
    render(<SpecsTable specs={specs} />);

    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
      'LOOP.RT',
      'LOOP.RT80.12W.30K.80A.APW.DALI',
      '<1%',
    ]);
  });

  it('разрешает перенос длинного артикула после точек (<wbr>)', () => {
    const { container } = render(<SpecsTable specs={specs} />);

    // Артикул из 7 частей → 6 мягких переносов; «LOOP.RT» → 1; «<1%» без точек → 0.
    expect(container.querySelectorAll('wbr')).toHaveLength(7);
  });
});
