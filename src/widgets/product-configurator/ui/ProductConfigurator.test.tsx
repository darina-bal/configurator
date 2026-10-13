import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getProductBySlug, type ProductVariant } from '@/entities/product';

import { ProductConfigurator } from './ProductConfigurator';

const locusDuo = getProductBySlug('locus_duo');
const loopRt = getProductBySlug('loop_rt_main');
const recessedWhite = locusDuo?.variants[0];
const surfaceWhite = locusDuo?.variants[3];
const recessedPatina = locusDuo?.variants[2];
if (!locusDuo || !loopRt || !recessedWhite || !surfaceWhite || !recessedPatina) {
  throw new Error('Нет данных каталога');
}

const normalized = (element: Element | null) => element?.textContent?.replace(/\s/g, ' ');

// Стрелочная функция, а не declaration: TS сохраняет сужение `locusDuo` только для неё.
const renderConfigurator = (variant: ProductVariant, onSelect = vi.fn()) =>
  render(
    <ProductConfigurator
      product={locusDuo}
      selection={variant.selection}
      variant={variant}
      onSelect={onSelect}
    />,
  );

describe('ProductConfigurator', () => {
  it('показывает название товара и шаги выбора опций', () => {
    renderConfigurator(recessedWhite);

    expect(screen.getByRole('heading', { level: 1, name: 'LOCUS DUO' })).toBeInTheDocument();
    const steps = screen.getAllByRole('heading', { level: 2 });
    expect(steps.map((step) => step.textContent)).toEqual(['Трек. Встроенный', 'Цвет. Белый']);
  });

  it('у товара с единственной опцией показывает один шаг', () => {
    const variant = loopRt.variants[0];
    if (!variant) throw new Error('Нет SKU');
    render(
      <ProductConfigurator
        product={loopRt}
        selection={variant.selection}
        variant={variant}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Цвет. Белый');
  });

  it('показывает цену с пометкой про НДС и наличие выбранного SKU', () => {
    renderConfigurator(recessedWhite);

    const summary = screen.getByRole('region', { name: 'Стоимость и наличие' });
    expect(summary).toHaveTextContent('Цена с НДС 22%');
    expect(normalized(summary)).toContain('10 800 ₽');
    expect(summary).toHaveTextContent('В наличии 199 шт');
  });

  it('не дублирует под блоком цены артикул и гарантию — они есть в таблице характеристик', () => {
    const { container } = renderConfigurator(recessedWhite);

    expect(container).not.toHaveTextContent(recessedWhite.sku);
    expect(container).not.toHaveTextContent(/Артикул|Гарантия/);
  });

  it('обновляет цену и остаток при другом SKU', () => {
    renderConfigurator(surfaceWhite);

    const summary = screen.getByRole('region', { name: 'Стоимость и наличие' });
    expect(normalized(summary)).toContain('18 600 ₽');
    expect(summary).toHaveTextContent('В наличии 99 шт');
  });

  it('для SKU без остатка сообщает о недоступности и отключает количество и кнопку', () => {
    renderConfigurator(recessedPatina);

    const summary = screen.getByRole('region', { name: 'Стоимость и наличие' });
    expect(within(summary).getByText('Нет в наличии')).toHaveAttribute('data-level', 'out');
    expect(within(summary).getByRole('button', { name: 'Нет в наличии' })).toBeDisabled();
    expect(within(summary).getByRole('spinbutton', { name: 'Количество' })).toBeDisabled();
  });

  it('озвучивает изменения цены и наличия через aria-live', () => {
    renderConfigurator(recessedWhite);

    const live = screen
      .getByRole('region', { name: 'Стоимость и наличие' })
      .querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent('Цена с НДС 22%');
    expect(normalized(live)).toContain('10 800 ₽');
    expect(live).toHaveTextContent('В наличии 199 шт');
  });

  it('при смене SKU начинает количество заново с одной штуки', async () => {
    const { rerender } = renderConfigurator(recessedWhite);
    await userEvent.click(screen.getByRole('button', { name: 'Увеличить количество' }));
    expect(screen.getByRole('spinbutton', { name: 'Количество' })).toHaveValue(2);

    rerender(
      <ProductConfigurator
        product={locusDuo}
        selection={surfaceWhite.selection}
        variant={surfaceWhite}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('spinbutton', { name: 'Количество' })).toHaveValue(1);
  });

  it('передаёт выбор опции наверх', async () => {
    const onSelect = vi.fn();
    renderConfigurator(recessedWhite, onSelect);

    await userEvent.click(screen.getByRole('radio', { name: /Накладной/ }));
    expect(onSelect).toHaveBeenLastCalledWith('track', 'surface');

    await userEvent.click(screen.getByRole('radio', { name: /Чёрный/ }));
    expect(onSelect).toHaveBeenLastCalledWith('finish', 'paint-black');
  });

  it('держит блок цены и кнопку «в корзину» под опциями', () => {
    renderConfigurator(recessedWhite);

    const radios = screen.getAllByRole('radio');
    const lastRadio = radios.at(-1);
    const button = screen.getByRole('button', { name: 'Добавить в корзину' });

    expect(lastRadio?.compareDocumentPosition(button)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
