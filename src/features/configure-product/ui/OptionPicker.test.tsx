import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getProductBySlug, type Selection } from '@/entities/product';

import { OptionPicker } from './OptionPicker';

const product = getProductBySlug('locus_duo');
const trackOption = product?.options.find((option) => option.id === 'track');
const finishOption = product?.options.find((option) => option.id === 'finish');
if (!product || !trackOption || !finishOption) throw new Error('Нет данных LOCUS DUO');

const recessedWhite: Selection = { track: 'recessed', finish: 'paint-white' };
const surfaceWhite: Selection = { track: 'surface', finish: 'paint-white' };

describe('OptionPicker: тип трека (карточки)', () => {
  it('показывает заголовок шага с выбранным значением и пояснение', () => {
    render(
      <OptionPicker
        product={product}
        option={trackOption}
        selection={recessedWhite}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Трек. Встроенный');
    expect(screen.getByText('Светильник подбирается под тип трека.')).toBeInTheDocument();
  });

  it('рисует значения как именованную радиогруппу с подсказками', () => {
    render(
      <OptionPicker
        product={product}
        option={trackOption}
        selection={recessedWhite}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('group', { name: 'Трек' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Встроенный.*Без видимой рамки/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Накладной.*возможен подвес/ })).not.toBeChecked();
  });

  it('не показывает цену: накладной трек дороже, но разница в опции не выводится', () => {
    render(
      <OptionPicker
        product={product}
        option={trackOption}
        selection={recessedWhite}
        onSelect={vi.fn()}
      />,
    );

    // Цена считается только в блоке цены: в карточках трека нет ни суммы, ни надбавки.
    expect(screen.getByRole('group', { name: 'Трек' })).not.toHaveTextContent('₽');
  });

  it('вызывает onSelect с идентификаторами опции и значения', async () => {
    const onSelect = vi.fn();
    render(
      <OptionPicker
        product={product}
        option={trackOption}
        selection={recessedWhite}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole('radio', { name: /Накладной/ }));

    expect(onSelect).toHaveBeenCalledWith('track', 'surface');
  });
});

describe('OptionPicker: цвет (свотчи)', () => {
  it('показывает оригинальные названия отделок', () => {
    render(
      <OptionPicker
        product={product}
        option={finishOption}
        selection={recessedWhite}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: /Белый.*PAINT WHITE/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Чёрный.*PAINT BLACK/ })).toBeInTheDocument();
  });

  it('помечает цвет без остатка и оставляет его доступным для выбора', async () => {
    const onSelect = vi.fn();
    render(
      <OptionPicker
        product={product}
        option={finishOption}
        selection={recessedWhite}
        onSelect={onSelect}
      />,
    );

    const patina = screen.getByRole('radio', { name: /Патина.*Нет в наличии/ });
    expect(patina).toBeEnabled();

    await userEvent.click(patina);
    expect(onSelect).toHaveBeenCalledWith('finish', 'patina-satin');
  });

  it('не показывает цену цвета: патина на накладном треке дороже, но в опции только пометка', () => {
    render(
      <OptionPicker
        product={product}
        option={finishOption}
        selection={surfaceWhite}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('group', { name: 'Цвет' })).not.toHaveTextContent('₽');
    // Патина на накладном треке нет в наличии — единственная пометка в опции.
    expect(screen.getByRole('radio', { name: /Патина/ }).closest('label')).toHaveTextContent(
      'Нет в наличии',
    );
  });
});
