import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ChoiceGroup, type ChoiceOption } from './ChoiceGroup';

const options: ChoiceOption[] = [
  { value: 'white', label: 'Белый', description: 'PAINT WHITE', swatch: '#f2f2f0' },
  { value: 'black', label: 'Чёрный', description: 'PAINT BLACK', swatch: '#111', meta: 'Новинка' },
  {
    value: 'patina',
    label: 'Патина',
    meta: 'Нет в наличии',
    metaTone: 'danger',
    unavailable: true,
  },
];

function Controlled({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('white');
  return (
    <ChoiceGroup
      name="finish"
      legend="Цвет"
      kind="swatch"
      options={options}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe('ChoiceGroup', () => {
  it('рендерит именованную группу из радиокнопок', () => {
    render(<Controlled />);
    const group = screen.getByRole('group', { name: 'Цвет' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('отмечает выбранное значение', () => {
    render(<Controlled />);
    expect(screen.getByRole('radio', { name: /Белый/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Чёрный/ })).not.toBeChecked();
  });

  it('вызывает onChange и переключает выбор по клику', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: /Чёрный/ }));

    expect(onChange).toHaveBeenCalledWith('black');
    expect(screen.getByRole('radio', { name: /Чёрный/ })).toBeChecked();
  });

  it('переключается стрелками с клавиатуры', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: /Белый/ })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('black');
    expect(screen.getByRole('radio', { name: /Чёрный/ })).toHaveFocus();
  });

  it('показывает пометку и описание в доступном имени значения', () => {
    render(<Controlled />);
    expect(screen.getByRole('radio', { name: /Чёрный.*Новинка.*PAINT BLACK/ })).toBeInTheDocument();
  });

  it('оставляет значение «нет в наличии» доступным для выбора', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    const patina = screen.getByRole('radio', { name: /Патина.*Нет в наличии/ });
    expect(patina).toBeEnabled();

    await userEvent.click(patina);
    expect(onChange).toHaveBeenCalledWith('patina');
  });
});
